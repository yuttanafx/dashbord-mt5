"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Invoice, InvoiceStatus } from "@/lib/types";

const statusLabel: Record<InvoiceStatus, string> = {
  draft: "ฉบับร่าง",
  sent: "ส่งแล้ว",
  paid: "ชำระแล้ว",
  overdue: "ค้างชำระ",
};

const statusStyle: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  paid: "bg-[var(--color-income-soft)] text-[var(--color-income)]",
  overdue: "bg-[var(--color-expense-soft)] text-[var(--color-expense)]",
};

function invoiceTotal(inv: Invoice): number {
  return inv.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export default function InvoicesPage() {
  const { invoices } = useData();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          ใบแจ้งหนี้
        </h1>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          สร้างใบแจ้งหนี้
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-10 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">
            ยังไม่มีใบแจ้งหนี้ สร้างใบแรกของคุณได้เลย
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {inv.invoiceNumber}
                </span>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[inv.status]}`}
                >
                  {statusLabel[inv.status]}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">
                {inv.clientName}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                ครบกำหนด {formatDate(inv.dueDate)}
              </p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {formatCurrency(invoiceTotal(inv))}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
