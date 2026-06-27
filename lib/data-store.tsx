"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth-context";
import {
  Transaction,
  BusinessDocument,
  DocumentType,
  DocumentStatus,
  CompanyProfile,
  DOCUMENT_PREFIX,
} from "./types";

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
  loading: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addDocument: (
    doc: Omit<BusinessDocument, "id" | "docNumber" | "type">,
    type: DocumentType
  ) => Promise<BusinessDocument>;
  updateDocumentStatus: (id: string, status: DocumentStatus) => Promise<void>;
  updateDocumentPaymentInfo: (
    id: string,
    info: { paymentMethod?: string; paidDate?: string }
  ) => Promise<void>;
  convertDocument: (id: string, toType: DocumentType) => Promise<BusinessDocument | null>;
  updateCompanyProfile: (profile: CompanyProfile) => Promise<void>;
  getDocument: (id: string) => BusinessDocument | undefined;
}

const DataContext = createContext<DataContextValue | null>(null);

function nextDocNumber(documents: BusinessDocument[], type: DocumentType): string {
  const prefix = DOCUMENT_PREFIX[type];
  const countOfType = documents.filter((d) => d.type === type).length;
  return `${prefix}-${String(countOfType + 1).padStart(4, "0")}`;
}

// ทุกคนที่ล็อกอินเข้ามาใช้ "ข้อมูลธุรกิจร่วมกันชุดเดียว" เก็บไว้ใต้เอกสารคงที่ชื่อ "shared"
// เหมาะกับธุรกิจเดียวที่มีพนักงาน/หุ้นส่วนหลายคนเข้าถึงข้อมูลเดียวกัน
const WORKSPACE_ID = "shared";

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [loading, setLoading] = useState(true);

  // ฟัง realtime update จาก Firestore ทันทีที่ล็อกอินสำเร็จ
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setDocuments([]);
      setCompanyProfile(defaultCompanyProfile);
      setLoading(false);
      return;
    }

    setLoading(true);

    const txQuery = query(
      collection(db, "workspaces", WORKSPACE_ID, "transactions"),
      orderBy("date", "desc")
    );
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      setTransactions(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction))
      );
    });

    const docsQuery = query(
      collection(db, "workspaces", WORKSPACE_ID, "documents"),
      orderBy("issueDate", "desc")
    );
    const unsubDocs = onSnapshot(docsQuery, (snapshot) => {
      setDocuments(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDocument))
      );
      setLoading(false);
    });

    const profileRef = doc(db, "workspaces", WORKSPACE_ID, "settings", "company");
    const unsubProfile = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        setCompanyProfile(snap.data() as CompanyProfile);
      }
    });

    return () => {
      unsubTx();
      unsubDocs();
      unsubProfile();
    };
  }, [user]);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id">) => {
    await addDoc(collection(db, "workspaces", WORKSPACE_ID, "transactions"), t);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "transactions", id));
  }, []);

  const addDocument = useCallback(
    async (docInput: Omit<BusinessDocument, "id" | "docNumber" | "type">, type: DocumentType) => {
      const docNumber = nextDocNumber(documents, type);
      const ref = await addDoc(collection(db, "workspaces", WORKSPACE_ID, "documents"), {
        ...docInput,
        docNumber,
        type,
      });
      return { ...docInput, id: ref.id, docNumber, type } as BusinessDocument;
    },
    [documents]
  );

  const updateDocumentStatus = useCallback(async (id: string, status: DocumentStatus) => {
    await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "documents", id), { status });
  }, []);

  const updateDocumentPaymentInfo = useCallback(
    async (id: string, info: { paymentMethod?: string; paidDate?: string }) => {
      await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "documents", id), info);
    },
    []
  );

  const convertDocument = useCallback(
    async (id: string, toType: DocumentType): Promise<BusinessDocument | null> => {
      const source = documents.find((d) => d.id === id);
      if (!source) return null;

      const docNumber = nextDocNumber(documents, toType);
      const todayStr = new Date().toISOString().slice(0, 10);

      const { id: _omitId, ...sourceData } = source;
      const newDocData = {
        ...sourceData,
        type: toType,
        docNumber,
        status: (toType === "receipt" ? "paid" : "draft") as DocumentStatus,
        issueDate: todayStr,
        convertedFromId: source.id,
        convertedToId: null,
        paidDate: toType === "receipt" ? todayStr : null,
      };

      const ref = await addDoc(
        collection(db, "workspaces", WORKSPACE_ID, "documents"),
        newDocData
      );

      await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "documents", source.id), {
        convertedToId: ref.id,
      });

      return {
        ...newDocData,
        id: ref.id,
        convertedToId: undefined,
        paidDate: newDocData.paidDate ?? undefined,
      } as BusinessDocument;
    },
    [documents]
  );

  const updateCompanyProfile = useCallback(async (profile: CompanyProfile) => {
    await setDoc(doc(db, "workspaces", WORKSPACE_ID, "settings", "company"), profile);
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
        loading,
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
