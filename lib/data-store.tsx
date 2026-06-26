"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  Transaction,
  BusinessDocument,
  DocumentType,
  DocumentStatus,
  CompanyProfile,
  DOCUMENT_PREFIX,
} from "./types";
import { generateId } from "./utils";

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

const seedDocuments: BusinessDocument[] = [
  {
    id: "d1",
    type: "invoice",
    docNumber: "INV-0001",
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

const defaultCompanyProfile: CompanyProfile = {
  name: "",
  address: "",
  taxId: "",
  phone: "",
  email: "",
  logoDataUrl: "",
};

interface DataContextValue {
  transactions: Transaction[];
  documents: BusinessDocument[];
  companyProfile: CompanyProfile;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addDocument: (
    doc: Omit<BusinessDocument, "id" | "docNumber" | "type">,
    type: DocumentType
  ) => BusinessDocument;
  updateDocumentStatus: (id: string, status: DocumentStatus) => void;
  updateDocumentPaymentInfo: (id: string, info: { paymentMethod?: string; paidDate?: string }) => void;
  convertDocument: (id: string, toType: DocumentType) => BusinessDocument | null;
  updateCompanyProfile: (profile: CompanyProfile) => void;
  getDocument: (id: string) => BusinessDocument | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

function nextDocNumber(documents: BusinessDocument[], type: DocumentType): string {
  const prefix = DOCUMENT_PREFIX[type];
  const countOfType = documents.filter((d) => d.type === type).length;
  return `${prefix}-${String(countOfType + 1).padStart(4, "0")}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [documents, setDocuments] = useState<BusinessDocument[]>(seedDocuments);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions((prev) => [{ ...t, id: generateId() }, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addDocument = useCallback(
    (doc: Omit<BusinessDocument, "id" | "docNumber" | "type">, type: DocumentType) => {
      const docNumber = nextDocNumber(documents, type);
      const created: BusinessDocument = { ...doc, id: generateId(), docNumber, type };
      setDocuments((prev) => [created, ...prev]);
      return created;
    },
    [documents]
  );

  const updateDocumentStatus = useCallback((id: string, status: DocumentStatus) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, status } : doc))
    );
  }, []);

  const updateDocumentPaymentInfo = useCallback(
    (id: string, info: { paymentMethod?: string; paidDate?: string }) => {
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === id ? { ...doc, ...info } : doc))
      );
    },
    []
  );

  const convertDocument = useCallback(
    (id: string, toType: DocumentType): BusinessDocument | null => {
      const source = documents.find((d) => d.id === id);
      if (!source) return null;

      const docNumber = nextDocNumber(documents, toType);
      const newDoc: BusinessDocument = {
        ...source,
        id: generateId(),
        type: toType,
        docNumber,
        status: toType === "receipt" ? "paid" : "draft",
        issueDate: new Date().toISOString().slice(0, 10),
        convertedFromId: source.id,
        convertedToId: undefined,
        paidDate: toType === "receipt" ? new Date().toISOString().slice(0, 10) : undefined,
      };

      setDocuments((prev) => [
        newDoc,
        ...prev.map((d) => (d.id === source.id ? { ...d, convertedToId: newDoc.id } : d)),
      ]);

      return newDoc;
    },
    [documents]
  );

  const updateCompanyProfile = useCallback((profile: CompanyProfile) => {
    setCompanyProfile(profile);
  }, []);

  const getDocument = useCallback(
    (id: string) => documents.find((d) => d.id === id),
    [documents]
  );

  return (
    <DataContext.Provider
      value={{
        transactions,
        documents,
        companyProfile,
        addTransaction,
        deleteTransaction,
        addDocument,
        updateDocumentStatus,
        updateDocumentPaymentInfo,
        convertDocument,
        updateCompanyProfile,
        getDocument,
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
