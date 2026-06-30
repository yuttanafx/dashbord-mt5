export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO date string, e.g. "2026-06-26"
  receiptImageUrl?: string; // รูปสลิปโอนเงิน/ใบเสร็จ เก็บเป็น base64 data URL (บีบอัดแล้ว)
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

// ประเภทเอกสาร: ใบเสนอราคา -> ใบแจ้งหนี้ -> ใบเสร็จรับเงิน
export type DocumentType = "quotation" | "invoice" | "receipt";

export type DocumentStatus =
  | "draft" // ฉบับร่าง
  | "sent" // ส่งแล้ว (ใบเสนอราคา/ใบแจ้งหนี้ ที่ส่งให้ลูกค้าแล้ว)
  | "accepted" // ลูกค้าตอบรับใบเสนอราคา
  | "paid" // ชำระเงินแล้ว (กลายเป็นใบเสร็จ)
  | "overdue"; // ค้างชำระ (เฉพาะใบแจ้งหนี้)

export interface BusinessDocument {
  id: string;
  type: DocumentType;
  docNumber: string; // เลขที่เอกสาร เช่น QT-0001, INV-0001, RCP-0001
  clientName: string;
  clientContact: string;
  issueDate: string;
  dueDate: string; // สำหรับใบเสนอราคา = วันที่ยืนราคา, ใบแจ้งหนี้ = ครบกำหนดชำระ
  items: InvoiceItem[];
  status: DocumentStatus;
  note: string;
  paymentMethod?: string; // ใช้กับใบเสร็จ เช่น เงินสด/โอน/บัตร
  paidDate?: string; // วันที่ได้รับเงินจริง (ใบเสร็จ)
  // เก็บสายธารการแปลงเอกสาร: ใบแจ้งหนี้รู้ว่ามาจากใบเสนอราคาใบไหน, ใบเสร็จรู้ว่ามาจากใบแจ้งหนี้ใบไหน
  convertedFromId?: string;
  convertedToId?: string;
}

export type DocumentTemplate = "simple" | "branded" | "detailed";

export interface CompanyProfile {
  name: string;
  address: string;
  taxId: string;
  phone: string;
  email: string;
  logoDataUrl: string; // เก็บโลโก้เป็น base64 data URL
  documentTemplate?: DocumentTemplate; // เทมเพลตที่ใช้พิมพ์เอกสารทุกใบ
}

export const DOCUMENT_TEMPLATE_LABEL: Record<DocumentTemplate, string> = {
  simple: "เรียบง่าย",
  branded: "โลโก้ใหญ่",
  detailed: "ละเอียด",
};

export const DOCUMENT_TEMPLATE_DESCRIPTION: Record<DocumentTemplate, string> = {
  simple: "ขาวสะอาด ไม่มีสีพื้นหลัง เน้นความเรียบ ประหยัดหมึกพิมพ์",
  branded: "แถบสีฟ้าเข้มคาดหัวกระดาษ โลโก้ใหญ่เด่น เหมาะกับการสร้างแบรนด์",
  detailed: "มีกรอบตารางครบ เลขลำดับรายการ เหมาะกับธุรกิจที่ต้องการความเป็นทางการสูง",
};

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  quotation: "ใบเสนอราคา",
  invoice: "ใบแจ้งหนี้",
  receipt: "ใบเสร็จรับเงิน",
};

export const DOCUMENT_PREFIX: Record<DocumentType, string> = {
  quotation: "QT",
  invoice: "INV",
  receipt: "RCP",
};

export const STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: "ฉบับร่าง",
  sent: "ส่งแล้ว",
  accepted: "ลูกค้าตอบรับ",
  paid: "ชำระแล้ว",
  overdue: "ค้างชำระ",
};

export const PAYMENT_METHODS = ["เงินสด", "โอนเงิน", "บัตรเครดิต/เดบิต", "เช็ค", "อื่นๆ"] as const;

// สถานะการประเมินความน่าเชื่อถือของสลิป/ใบเสร็จที่ AI วิเคราะห์
export type ReceiptValidity = "valid" | "needs_backup" | "unclear";

export const RECEIPT_VALIDITY_LABEL: Record<ReceiptValidity, string> = {
  valid: "ใช้ยืนบัญชีได้",
  needs_backup: "ควรออกใบเสร็จสำรอง",
  unclear: "ไม่ชัดเจน ต้องตรวจสอบเอง",
};

// รายการที่ AI (Gemini) วิเคราะห์จากรูปสลิป/ใบเสร็จที่ส่งเข้ากลุ่ม LINE
// รอให้ผู้ใช้ตรวจสอบ/แก้ไข/ยืนยันในเว็บแอป ก่อนจะถูกบันทึกเป็น Transaction จริง
export interface PendingReceipt {
  id: string;
  imageDataUrl: string; // รูปสลิปที่ดาวน์โหลดมาจาก LINE เก็บเป็น base64
  suggestedType: TransactionType;
  suggestedAmount: number;
  suggestedCategory: string;
  suggestedDate: string;
  suggestedNote: string;
  validity: ReceiptValidity;
  validityReason: string; // คำอธิบายจาก AI ว่าทำไมถึงประเมินแบบนี้
  rawAiResponse: string; // เก็บคำตอบดิบจาก Gemini ไว้เผื่อตรวจสอบย้อนหลัง
  lineUserId: string; // ผู้ส่งใน LINE (เผื่อต้องติดต่อกลับ)
  lineUserName: string;
  receivedAt: string; // ISO datetime ที่ได้รับเข้ามา
  status: "pending" | "confirmed" | "rejected";
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string; // หน่วยนับ เช่น ชิ้น, ขวด, กล่อง
  sellPrice: number;
  stockQty: number;
  lowStockThreshold: number; // แจ้งเตือนเมื่อสต็อกต่ำกว่าค่านี้
  note?: string;
}

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string; // เก็บชื่อ ณ ขณะนั้นไว้ เผื่อสินค้าถูกแก้ไข/ลบทีหลัง
  unit: string;
  quantity: number;
  unitCost: number; // ราคาต้นทุนต่อหน่วยที่ซื้อ
}

export type PurchaseOrderStatus = "draft" | "pending_approval" | "approved" | "received" | "cancelled";

export const PO_STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  draft: "ฉบับร่าง",
  pending_approval: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  received: "รับสินค้าแล้ว",
  cancelled: "ยกเลิก",
};

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  note: string;
  approvedAt?: string;
  receivedDocId?: string; // ลิงก์ไปยังใบรับสินค้าที่สร้างจาก PO นี้ (ถ้ามี)
}

export interface GoodsReceiptItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
}

export interface GoodsReceipt {
  id: string;
  grNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  receivedDate: string;
  items: GoodsReceiptItem[];
  note: string;
}

export interface CashSaleItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
}

export interface CashSale {
  id: string;
  saleNumber: string;
  saleDate: string;
  items: CashSaleItem[];
  total: number;
  note: string;
  transactionId?: string; // ลิงก์ไปยังรายการรายรับที่สร้างอัตโนมัติ
}

export const INCOME_CATEGORIES = [
  "ขายสินค้า",
  "ค่าบริการ",
  "รับชำระหนี้",
  "อื่นๆ",
] as const;

export const EXPENSE_CATEGORIES = [
  "ต้นทุนสินค้า",
  "ค่าเช่า",
  "ค่าแรง/เงินเดือน",
  "ค่าน้ำ-ไฟ-อินเทอร์เน็ต",
  "ค่าขนส่ง",
  "การตลาด",
  "อื่นๆ",
] as const;
