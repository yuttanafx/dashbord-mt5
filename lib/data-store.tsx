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
  Product,
  Supplier,
  PurchaseOrder,
  PurchaseOrderStatus,
  PurchaseOrderItem,
  GoodsReceipt,
  GoodsReceiptItem,
  CashSale,
  CashSaleItem,
  DOCUMENT_PREFIX,
} from "./types";

const defaultCompanyProfile: CompanyProfile = {
  name: "",
  address: "",
  taxId: "",
  phone: "",
  email: "",
  logoDataUrl: "",
  documentTemplate: "simple",
};

interface DataContextValue {
  transactions: Transaction[];
  documents: BusinessDocument[];
  products: Product[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  goodsReceipts: GoodsReceipt[];
  cashSales: CashSale[];
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
  deleteDocument: (id: string) => Promise<void>;
  updateCompanyProfile: (profile: CompanyProfile) => Promise<void>;
  getDocument: (id: string) => BusinessDocument | undefined;
  addProduct: (p: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, p: Omit<Product, "id">) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, delta: number) => Promise<void>;
  addSupplier: (s: Omit<Supplier, "id">) => Promise<void>;
  updateSupplier: (id: string, s: Omit<Supplier, "id">) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  addPurchaseOrder: (
    po: Omit<PurchaseOrder, "id" | "poNumber" | "status">
  ) => Promise<PurchaseOrder>;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  receivePurchaseOrder: (
    poId: string,
    receivedItems: { itemId: string; quantityReceived: number }[]
  ) => Promise<GoodsReceipt | null>;
  addCashSale: (items: CashSaleItem[], note: string) => Promise<CashSale | null>;
  deleteCashSale: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function nextDocNumber(documents: BusinessDocument[], type: DocumentType): string {
  const prefix = DOCUMENT_PREFIX[type];
  const countOfType = documents.filter((d) => d.type === type).length;
  return `${prefix}-${String(countOfType + 1).padStart(4, "0")}`;
}

function nextNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
}

// ทุกคนที่ล็อกอินเข้ามาใช้ "ข้อมูลธุรกิจร่วมกันชุดเดียว" เก็บไว้ใต้เอกสารคงที่ชื่อ "shared"
// เหมาะกับธุรกิจเดียวที่มีพนักงาน/หุ้นส่วนหลายคนเข้าถึงข้อมูลเดียวกัน
const WORKSPACE_ID = "shared";

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
  const [cashSales, setCashSales] = useState<CashSale[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [loading, setLoading] = useState(true);

  // ฟัง realtime update จาก Firestore ทันทีที่ล็อกอินสำเร็จ
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setDocuments([]);
      setProducts([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setGoodsReceipts([]);
      setCashSales([]);
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

    const productsQuery = query(
      collection(db, "workspaces", WORKSPACE_ID, "products"),
      orderBy("name", "asc")
    );
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
    });

    const suppliersQuery = query(
      collection(db, "workspaces", WORKSPACE_ID, "suppliers"),
      orderBy("name", "asc")
    );
    const unsubSuppliers = onSnapshot(suppliersQuery, (snapshot) => {
      setSuppliers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Supplier)));
    });

    const poQuery = query(
      collection(db, "workspaces", WORKSPACE_ID, "purchaseOrders"),
      orderBy("orderDate", "desc")
    );
    const unsubPO = onSnapshot(poQuery, (snapshot) => {
      setPurchaseOrders(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PurchaseOrder))
      );
    });

    const grQuery = query(
      collection(db, "workspaces", WORKSPACE_ID, "goodsReceipts"),
      orderBy("receivedDate", "desc")
    );
    const unsubGR = onSnapshot(grQuery, (snapshot) => {
      setGoodsReceipts(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as GoodsReceipt))
      );
    });

    const salesQuery = query(
      collection(db, "workspaces", WORKSPACE_ID, "cashSales"),
      orderBy("saleDate", "desc")
    );
    const unsubSales = onSnapshot(salesQuery, (snapshot) => {
      setCashSales(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CashSale)));
    });

    return () => {
      unsubTx();
      unsubDocs();
      unsubProfile();
      unsubProducts();
      unsubSuppliers();
      unsubPO();
      unsubGR();
      unsubSales();
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

  const deleteDocument = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "documents", id));
  }, []);

  const addProduct = useCallback(async (p: Omit<Product, "id">) => {
    await addDoc(collection(db, "workspaces", WORKSPACE_ID, "products"), p);
  }, []);

  const updateProduct = useCallback(async (id: string, p: Omit<Product, "id">) => {
    await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "products", id), { ...p });
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "products", id));
  }, []);

  // ปรับจำนวนสต็อก (delta บวก = เพิ่มสต็อก เช่น รับสินค้า, delta ลบ = ลดสต็อก เช่น ขายออก)
  const adjustStock = useCallback(
    async (id: string, delta: number) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      const newQty = Math.max(0, product.stockQty + delta);
      await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "products", id), {
        stockQty: newQty,
      });
    },
    [products]
  );

  // === ซัพพลายเออร์ ===
  const addSupplier = useCallback(async (s: Omit<Supplier, "id">) => {
    await addDoc(collection(db, "workspaces", WORKSPACE_ID, "suppliers"), s);
  }, []);

  const updateSupplier = useCallback(async (id: string, s: Omit<Supplier, "id">) => {
    await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "suppliers", id), { ...s });
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "suppliers", id));
  }, []);

  // === ใบสั่งซื้อ ===
  const addPurchaseOrder = useCallback(
    async (po: Omit<PurchaseOrder, "id" | "poNumber" | "status">) => {
      const poNumber = nextNumber("PO", purchaseOrders.length);
      const ref = await addDoc(collection(db, "workspaces", WORKSPACE_ID, "purchaseOrders"), {
        ...po,
        poNumber,
        status: "draft" as PurchaseOrderStatus,
      });
      return {
        ...po,
        id: ref.id,
        poNumber,
        status: "draft" as PurchaseOrderStatus,
      } as PurchaseOrder;
    },
    [purchaseOrders]
  );

  const updatePurchaseOrderStatus = useCallback(
    async (id: string, status: PurchaseOrderStatus) => {
      const extra: Record<string, unknown> = { status };
      if (status === "approved") {
        extra.approvedAt = new Date().toISOString().slice(0, 10);
      }
      await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "purchaseOrders", id), extra);
    },
    []
  );

  const deletePurchaseOrder = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "purchaseOrders", id));
  }, []);

  // รับสินค้าจริงตาม PO ที่อนุมัติแล้ว: สร้างใบรับสินค้า + เพิ่มสต็อกสินค้าทุกตัวที่รับ + ปิดสถานะ PO เป็น "received"
  const receivePurchaseOrder = useCallback(
    async (
      poId: string,
      receivedItems: { itemId: string; quantityReceived: number }[]
    ): Promise<GoodsReceipt | null> => {
      const po = purchaseOrders.find((p) => p.id === poId);
      if (!po || po.status !== "approved") return null;

      const grItems: GoodsReceiptItem[] = po.items.map((item) => {
        const received = receivedItems.find((r) => r.itemId === item.id);
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          unit: item.unit,
          quantityOrdered: item.quantity,
          quantityReceived: received ? received.quantityReceived : 0,
          unitCost: item.unitCost,
        };
      });

      const grNumber = nextNumber("GR", goodsReceipts.length);
      const grData = {
        grNumber,
        purchaseOrderId: po.id,
        poNumber: po.poNumber,
        supplierId: po.supplierId,
        supplierName: po.supplierName,
        receivedDate: new Date().toISOString().slice(0, 10),
        items: grItems,
        note: "",
      };

      const ref = await addDoc(
        collection(db, "workspaces", WORKSPACE_ID, "goodsReceipts"),
        grData
      );

      // เพิ่มสต็อกสินค้าทุกตัวตามจำนวนที่รับจริง
      for (const item of grItems) {
        if (item.quantityReceived > 0) {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "products", product.id), {
              stockQty: product.stockQty + item.quantityReceived,
            });
          }
        }
      }

      await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "purchaseOrders", po.id), {
        status: "received" as PurchaseOrderStatus,
        receivedDocId: ref.id,
      });

      return { ...grData, id: ref.id } as GoodsReceipt;
    },
    [purchaseOrders, goodsReceipts, products]
  );

  // === ขายเงินสด/แคชเชียร์ ===
  // ตัดสต็อกสินค้าออกทันที + สร้างรายการรายรับอัตโนมัติในบัญชี
  const addCashSale = useCallback(
    async (items: CashSaleItem[], note: string): Promise<CashSale | null> => {
      if (items.length === 0) return null;

      const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
      const saleNumber = nextNumber("CS", cashSales.length);
      const saleDate = new Date().toISOString().slice(0, 10);

      const txRef = await addDoc(collection(db, "workspaces", WORKSPACE_ID, "transactions"), {
        type: "income",
        amount: total,
        category: "ขายสินค้า",
        note: note || `ขายเงินสด ${saleNumber}`,
        date: saleDate,
      });

      const saleData = {
        saleNumber,
        saleDate,
        items,
        total,
        note,
        transactionId: txRef.id,
      };

      const ref = await addDoc(collection(db, "workspaces", WORKSPACE_ID, "cashSales"), saleData);

      // ตัดสต็อกสินค้าทุกตัวที่ขายออกทันที
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          await updateDoc(doc(db, "workspaces", WORKSPACE_ID, "products", product.id), {
            stockQty: Math.max(0, product.stockQty - item.quantity),
          });
        }
      }

      return { ...saleData, id: ref.id } as CashSale;
    },
    [cashSales, products]
  );

  const deleteCashSale = useCallback(async (id: string) => {
    await deleteDoc(doc(db, "workspaces", WORKSPACE_ID, "cashSales", id));
  }, []);

  return (
    <DataContext.Provider
      value={{
        transactions,
        documents,
        products,
        suppliers,
        purchaseOrders,
        goodsReceipts,
        cashSales,
        companyProfile,
        loading,
        addTransaction,
        deleteTransaction,
        addDocument,
        updateDocumentStatus,
        updateDocumentPaymentInfo,
        convertDocument,
        deleteDocument,
        updateCompanyProfile,
        getDocument,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addPurchaseOrder,
        updatePurchaseOrderStatus,
        deletePurchaseOrder,
        receivePurchaseOrder,
        addCashSale,
        deleteCashSale,
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
