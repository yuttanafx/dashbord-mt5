export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string; // ISO date string, e.g. "2026-06-26"
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

export interface CompanyProfile {
  name: string;
  address: string;
  taxId: string;
  phone: string;
  email: string;
  logoDataUrl: string; // เก็บโลโก้เป็น base64 data URL
}

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
