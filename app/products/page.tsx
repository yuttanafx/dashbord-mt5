"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, AlertTriangle, Package } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency } from "@/lib/utils";

export default function ProductsPage() {
  const { products } = useData();
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const lowStockCount = products.filter((p) => p.stockQty <= p.lowStockThreshold).length;

  const filtered = useMemo(() => {
    let list = products;
    if (showLowStockOnly) {
      list = list.filter((p) => p.stockQty <= p.lowStockThreshold);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, search, showLowStockOnly]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">สินค้า</h1>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          เพิ่มสินค้า
        </Link>
      </div>

      {/* แจ้งเตือนสินค้าใกล้หมด */}
      {lowStockCount > 0 && (
        <button
          onClick={() => setShowLowStockOnly((v) => !v)}
          className={`w-full mb-5 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm text-left transition-colors ${
            showLowStockOnly
              ? "bg-[var(--color-expense)] text-white border-[var(--color-expense)]"
              : "bg-[var(--color-expense-soft)] text-[var(--color-expense)] border-transparent"
          }`}
        >
          <AlertTriangle size={16} className="shrink-0" />
          <span>
            มีสินค้าใกล้หมด <strong>{lowStockCount} รายการ</strong> — กดเพื่อ
            {showLowStockOnly ? "แสดงทั้งหมด" : "ดูเฉพาะรายการนี้"}
          </span>
        </button>
      )}

      {/* ค้นหา */}
      <div className="relative mb-5">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อสินค้าหรือรหัส SKU"
          className="w-full rounded-xl border border-[var(--color-border)] pl-10 pr-4 py-2.5 text-sm bg-[var(--color-card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      </div>

      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6">
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <Package size={28} className="mx-auto text-[var(--color-text-muted)] mb-2" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              {products.length === 0 ? "ยังไม่มีสินค้า เพิ่มรายการแรกได้เลย" : "ไม่พบสินค้าที่ค้นหา"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((p) => {
              const isLow = p.stockQty <= p.lowStockThreshold;
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center gap-3 py-3 hover:bg-[var(--color-app-bg)] -mx-1 px-1 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      SKU: {p.sku} · {formatCurrency(p.sellPrice)} / {p.unit}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-semibold ${
                        isLow ? "text-[var(--color-expense)]" : "text-[var(--color-text-primary)]"
                      }`}
                    >
                      {p.stockQty} {p.unit}
                    </p>
                    {isLow && (
                      <p className="text-xs text-[var(--color-expense)]">ใกล้หมด</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
