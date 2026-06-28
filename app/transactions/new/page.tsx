"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, X, Loader2 } from "lucide-react";
import { useData } from "@/lib/data-store";
import { TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/types";
import { todayISO, compressImageToDataUrl } from "@/lib/utils";

export default function NewTransactionPage() {
  const router = useRouter();
  const { addTransaction } = useData();

  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [processingImage, setProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(next === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessingImage(true);
    setError("");
    try {
      const compressed = await compressImageToDataUrl(file);
      setReceiptImage(compressed);
    } catch {
      setError("ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่");
    } finally {
      setProcessingImage(false);
    }
  }

  function removeImage() {
    setReceiptImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: numericAmount,
        category,
        note,
        date,
        ...(receiptImage ? { receiptImageUrl: receiptImage } : {}),
      });
      router.push("/");
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

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        บันทึกรายการใหม่
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6 space-y-5"
      >
        {/* Toggle ประเภท */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            ประเภทรายการ
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--color-app-bg)] rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                type === "income"
                  ? "bg-[var(--color-income)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              รายรับ
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                type === "expense"
                  ? "bg-[var(--color-expense)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              รายจ่าย
            </button>
          </div>
        </div>

        {/* จำนวนเงิน */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            จำนวนเงิน (บาท)
          </label>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-lg font-medium text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* หมวดหมู่ */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            หมวดหมู่
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-primary)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* วันที่ */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            วันที่
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* บันทึกเพิ่มเติม */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            บันทึกเพิ่มเติม (ไม่บังคับ)
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="เช่น ขายสินค้าหน้าร้าน"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {/* แนบรูปสลิป/ใบเสร็จ */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            แนบรูปสลิป/ใบเสร็จ (ไม่บังคับ)
          </label>
          {receiptImage ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receiptImage}
                alt="สลิป/ใบเสร็จที่แนบ"
                className="w-32 h-32 object-cover rounded-xl border border-[var(--color-border)]"
              />
              <button
                type="button"
                onClick={removeImage}
                aria-label="ลบรูปที่แนบ"
                className="absolute -top-2 -right-2 bg-[var(--color-expense)] text-white rounded-full p-1 shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processingImage}
              className="w-32 h-32 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-app-bg)] flex flex-col items-center justify-center gap-1.5 text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-60"
            >
              {processingImage ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Camera size={20} />
                  <span className="text-xs">แนบรูป</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-expense)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting || processingImage}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
        >
          {submitting ? "กำลังบันทึก..." : "บันทึกรายการ"}
        </button>
      </form>
    </div>
  );
}
