"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/lib/data-store";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/types";

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useData();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("ชิ้น");
  const [sellPrice, setSellPrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(DEFAULT_LOW_STOCK_THRESHOLD)
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณากรอกชื่อสินค้า");
      return;
    }
    const price = parseFloat(sellPrice);
    if (!sellPrice || isNaN(price) || price < 0) {
      setError("กรุณากรอกราคาขายให้ถูกต้อง");
      return;
    }
    const qty = parseInt(stockQty || "0", 10);
    const threshold = parseInt(lowStockThreshold || "0", 10);

    setError("");
    setSubmitting(true);
    try {
      await addProduct({
        name: name.trim(),
        sku: sku.trim(),
        unit: unit.trim() || "ชิ้น",
        sellPrice: price,
        stockQty: isNaN(qty) ? 0 : qty,
        lowStockThreshold: isNaN(threshold) ? DEFAULT_LOW_STOCK_THRESHOLD : threshold,
        note: note.trim(),
      });
      router.push("/products");
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 md:px-8 py-6 md:py-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        <ArrowLeft size={16} />
        กลับ
      </button>

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">เพิ่มสินค้า</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            ชื่อสินค้า
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="เช่น เสื้อยืดคอกลม สีขาว"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              รหัสสินค้า (SKU)
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="เช่น TS-WH-001"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              หน่วยนับ
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="ชิ้น / ขวด / กล่อง"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              ราคาขาย (บาท)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              จำนวนสต็อกเริ่มต้น
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            แจ้งเตือนเมื่อสต็อกต่ำกว่า
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            บันทึกเพิ่มเติม (ไม่บังคับ)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="หมายเหตุเกี่ยวกับสินค้า"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-expense)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
        >
          {submitting ? "กำลังบันทึก..." : "บันทึกสินค้า"}
        </button>
      </form>
    </div>
  );
}
