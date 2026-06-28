"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PurchaseOrderStatus, PO_STATUS_LABEL } from "@/lib/types";

type Filter = "all" | PurchaseOrderStatus;

const statusStyle: Record<PurchaseOrderStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  received: "bg-[var(--color-income-soft)] text-[var(--color-income)]",
  cancelled: "bg-[var(--color-expense-soft)] text-[var(--color-expense)]",
};

function poTotal(items: { quantity: number; unitCost: number }[]): number {
  return items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);
}

export default function PurchaseOrdersPage() {
  const { purchaseOrders } = useData();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = purchaseOrders.filter((po) => (filter === "all" ? true : po.status === filter));

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">ใบสั่งซื้อ</h1>
        <Link
          href="/purchase-orders/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          สร้างใบสั่งซื้อ
        </Link>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "draft", "pending_approval", "approved", "received"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
            }`}
          >
            {f === "all" ? "ทั้งหมด" : PO_STATUS_LABEL[f]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-10 text-center">
          <ClipboardList size={28} className="mx-auto text-[var(--color-text-muted)] mb-2" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            ไม่มีใบสั่งซื้อในหมวดนี้
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((po) => (
            <Link
              key={po.id}
              href={`/purchase-orders/${po.id}`}
              className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 hover:border-[var(--color-primary)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3 gap-2">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {po.poNumber}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[po.status]}`}>
                  {PO_STATUS_LABEL[po.status]}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">{po.supplierName}</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-3">
                สั่งวันที่ {formatDate(po.orderDate)}
              </p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {formatCurrency(poTotal(po.items))}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
