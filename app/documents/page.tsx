"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency, formatDate, documentTotal } from "@/lib/utils";
import { DocumentType, DocumentStatus, DOCUMENT_TYPE_LABEL } from "@/lib/types";

type Filter = "all" | DocumentType;

const statusLabel: Record<DocumentStatus, string> = {
  draft: "ฉบับร่าง",
  sent: "ส่งแล้ว",
  accepted: "ตอบรับแล้ว",
  paid: "ชำระแล้ว",
  overdue: "ค้างชำระ",
};

const statusStyle: Record<DocumentStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  accepted: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  paid: "bg-[var(--color-income-soft)] text-[var(--color-income)]",
  overdue: "bg-[var(--color-expense-soft)] text-[var(--color-expense)]",
};

const typeStyle: Record<DocumentType, string> = {
  quotation: "bg-slate-100 text-slate-600",
  invoice: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  receipt: "bg-[var(--color-income-soft)] text-[var(--color-income)]",
};

export default function DocumentsPage() {
  const { documents } = useData();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = documents.filter((d) => (filter === "all" ? true : d.type === filter));

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">เอกสาร</h1>
        <Link
          href="/documents/new?type=quotation"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          สร้างเอกสารใหม่
        </Link>
      </div>

      {/* ตัวกรอง */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          { key: "all" as Filter, label: "ทั้งหมด" },
          { key: "quotation" as Filter, label: "ใบเสนอราคา" },
          { key: "invoice" as Filter, label: "ใบแจ้งหนี้" },
          { key: "receipt" as Filter, label: "ใบเสร็จรับเงิน" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-10 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            ไม่มีเอกสารในหมวดนี้ สร้างใบแรกของคุณได้เลย
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((doc) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${typeStyle[doc.type]}`}>
                    {DOCUMENT_TYPE_LABEL[doc.type]}
                  </span>
                  <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {doc.docNumber}
                  </span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[doc.status]}`}>
                  {statusLabel[doc.status]}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">{doc.clientName}</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                ออกวันที่ {formatDate(doc.issueDate)}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {formatCurrency(documentTotal(doc.items))}
                </p>
                {doc.convertedToId && (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    แปลงแล้ว <ArrowRight size={12} />
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
