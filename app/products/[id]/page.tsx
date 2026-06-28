"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { products, updateProduct, deleteProduct, adjustStock } = useData();

  const product = products.find((p) => p.id === params.id);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [unit, setUnit] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("1");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku);
      setUnit(product.unit);
      setSellPrice(String(product.sellPrice));
      setLowStockThreshold(String(product.lowStockThreshold));
      setNote(product.note || "");
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">ไม่พบสินค้านี้</p>
        <button
          onClick={() => router.push("/products")}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          กลับไปหน้าสินค้า
        </button>
      </div>
    );
  }

  const isLow = product.stockQty <= product.lowStockThreshold;
  const productId = product.id;
  const currentStockQty = product.stockQty;
  const productName = product.name;

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
    setError("");
    setSubmitting(true);
    try {
      await updateProduct(productId, {
        name: name.trim(),
        sku: sku.trim(),
        unit: unit.trim() || "ชิ้น",
        sellPrice: price,
        stockQty: currentStockQty,
        lowStockThreshold: parseInt(lowStockThreshold || "0", 10) || 0,
        note: note.trim(),
      });
      router.push("/products");
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`ลบสินค้า "${productName}" ใช่หรือไม่?`)) return;
    await deleteProduct(productId);
    router.push("/products");
  }

  async function handleAdjust(direction: 1 | -1) {
    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    await adjustStock(productId, amount * direction);
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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">แก้ไขสินค้า</h1>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-expense)] hover:underline"
        >
          <Trash2 size={14} />
          ลบสินค้า
        </button>
      </div>

      {/* ปรับสต็อกด่วน */}
      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 mb-5">
        <p className="text-sm text-[var(--color-text-secondary)] mb-1">สต็อกปัจจุบัน</p>
        <p
          className={`text-2xl font-bold mb-4 ${
            isLow ? "text-[var(--color-expense)]" : "text-[var(--color-text-primary)]"
          }`}
        >
          {product.stockQty} {product.unit}
          {isLow && <span className="text-xs font-medium ml-2">(ใกล้หมด)</span>}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAdjust(-1)}
            className="p-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-expense)] hover:bg-[var(--color-expense-soft)]"
            aria-label="ลดสต็อก"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min="1"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
            className="w-20 text-center rounded-lg border border-[var(--color-border)] px-2 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <button
            type="button"
            onClick={() => handleAdjust(1)}
            className="p-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-income)] hover:bg-[var(--color-income-soft)]"
            aria-label="เพิ่มสต็อก"
          >
            <Plus size={16} />
          </button>
          <span className="text-xs text-[var(--color-text-muted)] ml-1">
            {product.unit}
          </span>
        </div>
      </div>

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
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              แจ้งเตือนเมื่อต่ำกว่า
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
          {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </form>
    </div>
  );
}
