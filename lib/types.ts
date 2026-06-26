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

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientContact: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  note: string;
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
