"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useData } from "@/lib/data-store";
import { PurchaseOrderItem } from "@/lib/types";
import { formatCurrency, todayISO, generateId } from "@/lib/utils";

function nextWeekISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { suppliers, products, addPurchaseOrder } = useData();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "");
  const [orderDate, setOrderDate] = useState(todayISO());
  const [expectedDate, setExpectedDate] = useState(nextWeekISO());
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);

  function addItem() {
    const firstProduct = products[0];
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        productId: firstProduct?.id || "",
        productName: firstProduct?.name || "",
        unit: firstProduct?.unit || "",
        quantity: 1,
        unitCost: 0,
      },
    ]);
  }

  function updateItem(id: string, patch: Partial<PurchaseOrderItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function handleProductChange(itemId: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateItem(itemId, {
      productId,
      productName: product?.name || "",
      unit: product?.unit || "",
    });
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supplierId) {
      setError("กรุณาเลือกซัพพลายเออร์");
      return;
    }
    if (items.length === 0 || items.some((it) => !it.productId || it.quantity <= 0)) {
      setError("กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ และกรอกจำนวนให้ถูกต้อง");
      return;
    }
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      setError("ไม่พบซัพพลายเออร์ที่เลือก");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const created = await addPurchaseOrder({
        supplierId,
        supplierName: supplier.name,
        orderDate,
        expectedDate,
        items,
        note,
      });
      router.push(`/purchase-orders/${created.id}`);
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
    }
  }

  if (suppliers.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 md:px-8 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          ยังไม่มีซัพพลายเออร์ ต้องเพิ่มซัพพลายเออร์ก่อนสร้างใบสั่งซื้อ
        </p>
        <Link
          href="/suppliers/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} />
          เพิ่มซัพพลายเออร์
        </Link>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 md:px-8 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          ยังไม่มีสินค้าในระบบ ต้องเพิ่มสินค้าก่อนสร้างใบสั่งซื้อ
        </p>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} />
          เพิ่มสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        <ArrowLeft size={16} />
        กลับ
      </button>

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">สร้างใบสั่งซื้อ</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            ซัพพลายเออร์
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              วันที่สั่งซื้อ
            </label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              วันที่คาดว่าจะได้รับ
            </label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            รายการสินค้าที่สั่งซื้อ
          </label>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 items-start">
                <select
                  value={item.productId}
                  onChange={(e) => handleProductChange(item.id, e.target.value)}
                  className="flex-1 min-w-0 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="จำนวน"
                  className="w-20 rounded-xl border border-[var(--color-border)] px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitCost}
                  onChange={(e) => updateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                  placeholder="ราคา/หน่วย"
                  className="w-24 rounded-xl border border-[var(--color-border)] px-2 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="ลบรายการนี้"
                  className="p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-expense)] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <Plus size={14} />
            เพิ่มสินค้า
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">ยอดรวม</span>
          <span className="text-xl font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(total)}
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            บันทึกเพิ่มเติม (ไม่บังคับ)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-expense)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
        >
          {submitting ? "กำลังบันทึก..." : "สร้างใบสั่งซื้อ"}
        </button>
      </form>
    </div>
  );
}
