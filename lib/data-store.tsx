"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Transaction, Invoice } from "./types";

const seedTransactions: Transaction[] = [
  {
    id: "t1",
    type: "income",
    amount: 8500,
    category: "ขายสินค้า",
    note: "ขายส่งหน้าร้าน",
    date: "2026-06-24",
  },
  {
    id: "t2",
    type: "expense",
    amount: 1200,
    category: "ค่าน้ำ-ไฟ-อินเทอร์เน็ต",
    note: "ค่าไฟเดือนมิถุนายน",
    date: "2026-06-23",
  },
  {
    id: "t3",
    type: "income",
    amount: 3200,
    category: "ค่าบริการ",
    note: "ค่าออกแบบโลโก้",
    date: "2026-06-20",
  },
  {
    id: "t4",
    type: "expense",
    amount: 4500,
    category: "ต้นทุนสินค้า",
    note: "สั่งซื้อวัตถุดิบรอบใหม่",
    date: "2026-06-18",
  },
];

const seedInvoices: Invoice[] = [
  {
    id: "i1",
    invoiceNumber: "INV-0001",
    clientName: "บริษัท ทดสอบ จำกัด",
    clientContact: "081-234-5678",
    issueDate: "2026-06-15",
    dueDate: "2026-06-30",
    items: [
      { id: "li1", description: "ค่าออกแบบเว็บไซต์", quantity: 1, unitPrice: 15000 },
    ],
    status: "sent",
    note: "",
  },
];

interface DataContextValue {
  transactions: Transaction[];
  invoices: Invoice[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addInvoice: (inv: Omit<Invoice, "id">) => void;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...t, id: generateId() }, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addInvoice = useCallback((inv: Omit<Invoice, "id">) => {
    setInvoices((prev) => [{ ...inv, id: generateId() }, ...prev]);
  }, []);

  const updateInvoiceStatus = useCallback((id: string, status: Invoice["status"]) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  }, []);

  return (
    <DataContext.Provider
      value={{
        transactions,
        invoices,
        addTransaction,
        deleteTransaction,
        addInvoice,
        updateInvoiceStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error("useData must be used within a DataProvider");
  }
  return ctx;
}
