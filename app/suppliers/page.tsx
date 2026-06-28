"use client";

import Link from "next/link";
import { Plus, Truck } from "lucide-react";
import { useData } from "@/lib/data-store";

export default function SuppliersPage() {
  const { suppliers } = useData();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">ซัพพลายเออร์</h1>
        <Link
          href="/suppliers/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          เพิ่มซัพพลายเออร์
        </Link>
      </div>

      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6">
        {suppliers.length === 0 ? (
          <div className="py-10 text-center">
            <Truck size={28} className="mx-auto text-[var(--color-text-muted)] mb-2" />
            <p className="text-sm text-[var(--color-text-secondary)]">
              ยังไม่มีซัพพลายเออร์ เพิ่มรายการแรกได้เลย
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {suppliers.map((s) => (
              <Link
                key={s.id}
                href={`/suppliers/${s.id}`}
                className="flex items-center gap-3 py-3 hover:bg-[var(--color-app-bg)] -mx-1 px-1 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {s.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] truncate">
                    {[s.phone, s.address].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
