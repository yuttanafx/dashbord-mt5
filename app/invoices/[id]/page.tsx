"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceStatus } from "@/lib/types";

const statusLabel: Record<InvoiceStatus, string> = {
  draft: "ฉบับร่าง",
  sent: "ส่งแล้ว",
  paid: "ชำระแล้ว",
  overdue: "ค้างชำระ",
};

const allStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { invoices, updateInvoiceStatus } = useData();

  const invoice = invoices.find((inv) => inv.id === params.id);

  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          ไม่พบใบแจ้งหนี้นี้
        </p>
        <button
          onClick={() => router.push("/invoices")}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          กลับไปหน้าใบแจ้งหนี้
        </button>
      </div>
    );
  }

  const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <button
        onClick={() => router.push("/invoices")}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        <ArrowLeft size={16} />
        กลับไปหน้าใบแจ้งหนี้
      </button>

      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              ออกวันที่ {formatDate(invoice.issueDate)} · ครบกำหนด {formatDate(invoice.dueDate)}
            </p>
          </div>
          <select
            value={invoice.status}
            onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
            className="rounded-full text-xs font-medium px-3 py-1.5 border border-[var(--color-border)] bg-[var(--color-app-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">ลูกค้า</p>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {invoice.clientName}
          </p>
          {invoice.clientContact && (
            <p className="text-sm text-[var(--color-text-secondary)]">{invoice.clientContact}</p>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-[var(--color-text-muted)] mb-2 px-1">
            <span>รายละเอียด</span>
            <span className="text-center">จำนวน</span>
            <span className="text-right">ราคา</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {invoice.items.map((item) => (
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
      </div>
    </div>
  );
}
