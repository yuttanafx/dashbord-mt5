"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, ArrowRight, Check } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency, formatDate, documentTotal } from "@/lib/utils";
import { DocumentStatus, DocumentType, DOCUMENT_TYPE_LABEL, PAYMENT_METHODS } from "@/lib/types";

const statusLabel: Record<DocumentStatus, string> = {
  draft: "ฉบับร่าง",
  sent: "ส่งแล้ว",
  accepted: "ตอบรับแล้ว",
  paid: "ชำระแล้ว",
  overdue: "ค้างชำระ",
};

const statusOptionsByType: Record<DocumentType, DocumentStatus[]> = {
  quotation: ["draft", "sent", "accepted"],
  invoice: ["draft", "sent", "paid", "overdue"],
  receipt: ["paid"],
};

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { documents, updateDocumentStatus, convertDocument, getDocument, updateDocumentPaymentInfo } = useData();

  const doc = documents.find((d) => d.id === params.id);

  if (!doc) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">ไม่พบเอกสารนี้</p>
        <button
          onClick={() => router.push("/documents")}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          กลับไปหน้าเอกสาร
        </button>
      </div>
    );
  }

  const total = documentTotal(doc.items);
  const source = doc.convertedFromId ? getDocument(doc.convertedFromId) : undefined;
  const convertedTo = doc.convertedToId ? getDocument(doc.convertedToId) : undefined;
  const docId = doc.id;

  const nextType: DocumentType | null =
    doc.type === "quotation" ? "invoice" : doc.type === "invoice" ? "receipt" : null;

  function handleConvert() {
    if (!nextType) return;
    const newDoc = convertDocument(docId, nextType);
    if (newDoc) {
      router.push(`/documents/${newDoc.id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/documents")}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} />
          กลับไปหน้าเอกสาร
        </button>
        <a
          href={`/documents/${doc.id}/print`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          <Printer size={16} />
          พิมพ์ / บันทึก PDF
        </a>
      </div>

      {/* แถบบอกลำดับเอกสารที่เชื่อมกัน */}
      {(source || convertedTo) && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-4 flex-wrap">
          {source && (
            <>
              <a href={`/documents/${source.id}`} className="hover:underline">
                {DOCUMENT_TYPE_LABEL[source.type]} {source.docNumber}
              </a>
              <ArrowRight size={12} />
            </>
          )}
          <span className="font-medium text-[var(--color-text-secondary)]">
            {DOCUMENT_TYPE_LABEL[doc.type]} {doc.docNumber}
          </span>
          {convertedTo && (
            <>
              <ArrowRight size={12} />
              <a href={`/documents/${convertedTo.id}`} className="hover:underline">
                {DOCUMENT_TYPE_LABEL[convertedTo.type]} {convertedTo.docNumber}
              </a>
            </>
          )}
        </div>
      )}

      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8">
        <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
          <div>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {DOCUMENT_TYPE_LABEL[doc.type]}
            </span>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {doc.docNumber}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              ออกวันที่ {formatDate(doc.issueDate)}
              {doc.type !== "receipt" && ` · ${doc.type === "quotation" ? "ยืนราคาถึง" : "ครบกำหนด"} ${formatDate(doc.dueDate)}`}
            </p>
          </div>
          <select
            value={doc.status}
            onChange={(e) => updateDocumentStatus(doc.id, e.target.value as DocumentStatus)}
            className="rounded-full text-xs font-medium px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-app-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {statusOptionsByType[doc.type].map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">ลูกค้า</p>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{doc.clientName}</p>
          {doc.clientContact && (
            <p className="text-sm text-[var(--color-text-secondary)]">{doc.clientContact}</p>
          )}
        </div>

        {doc.type === "receipt" && (
          <div className="mb-6 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">วิธีชำระเงิน</p>
              <select
                value={doc.paymentMethod || PAYMENT_METHODS[0]}
                onChange={(e) => updateDocumentPaymentInfo(doc.id, { paymentMethod: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">วันที่รับเงิน</p>
              <input
                type="date"
                value={doc.paidDate || ""}
                onChange={(e) => updateDocumentPaymentInfo(doc.id, { paidDate: e.target.value })}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        )}

        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-[var(--color-text-muted)] mb-2 px-1">
            <span>รายละเอียด</span>
            <span className="text-center">จำนวน</span>
            <span className="text-right">ราคา</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {doc.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-2 py-2.5 px-1 text-sm">
                <span className="text-[var(--color-text-primary)]">{item.description}</span>
                <span className="text-center text-[var(--color-text-secondary)]">{item.quantity}</span>
                <span className="text-right font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--color-border)]">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">ยอดรวมทั้งหมด</span>
          <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(total)}
          </span>
        </div>

        {doc.note && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-4 pt-4 border-t border-[var(--color-border)]">
            หมายเหตุ: {doc.note}
          </p>
        )}
      </div>

      {/* ปุ่มแปลงเอกสารไปขั้นต่อไป */}
      {nextType && !doc.convertedToId && (
        <button
          onClick={handleConvert}
          className="w-full mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2"
        >
          <ArrowRight size={16} />
          แปลงเป็น{DOCUMENT_TYPE_LABEL[nextType]}
        </button>
      )}
      {doc.convertedToId && (
        <p className="text-center text-sm text-[var(--color-text-muted)] mt-4 inline-flex items-center justify-center gap-1.5 w-full">
          <Check size={14} />
          แปลงเป็น{convertedTo ? DOCUMENT_TYPE_LABEL[convertedTo.type] : ""}แล้ว
        </p>
      )}
    </div>
  );
}
