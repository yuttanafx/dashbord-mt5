"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ImageIcon, X } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency, formatDate } from "@/lib/utils";

type Filter = "all" | "income" | "expense";

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useData();
  const [filter, setFilter] = useState<Filter>("all");
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const filtered = transactions.filter((t) =>
    filter === "all" ? true : t.type === filter
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          รายการทั้งหมด
        </h1>
        <Link
          href="/transactions/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          เพิ่มรายการ
        </Link>
      </div>

      {/* ตัวกรอง */}
      <div className="flex gap-2 mb-5">
        {[
          { key: "all" as Filter, label: "ทั้งหมด" },
          { key: "income" as Filter, label: "รายรับ" },
          { key: "expense" as Filter, label: "รายจ่าย" },
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

      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-8 text-center">
            ไม่มีรายการในหมวดนี้
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 py-3">
                {tx.receiptImageUrl ? (
                  <button
                    onClick={() => setViewingImage(tx.receiptImageUrl!)}
                    className="shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-[var(--color-border)]"
                    aria-label="ดูรูปสลิป/ใบเสร็จ"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tx.receiptImageUrl}
                      alt="สลิป/ใบเสร็จ"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--color-app-bg)] flex items-center justify-center text-[var(--color-text-muted)]">
                    <ImageIcon size={16} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {tx.note || tx.category}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold shrink-0 ${
                    tx.type === "income"
                      ? "text-[var(--color-income)]"
                      : "text-[var(--color-expense)]"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  aria-label="ลบรายการ"
                  className="shrink-0 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-expense)] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal ดูรูปขยาย */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setViewingImage(null)}
              aria-label="ปิด"
              className="absolute -top-10 right-0 text-white p-2"
            >
              <X size={22} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={viewingImage}
              alt="สลิป/ใบเสร็จขนาดเต็ม"
              className="w-full rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
