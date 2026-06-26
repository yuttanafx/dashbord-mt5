"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/lib/data-store";
import { TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/types";
import { todayISO } from "@/lib/utils";

export default function NewTransactionPage() {
  const router = useRouter();
  const { addTransaction } = useData();

  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(INCOME_CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(next === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError("กรุณากรอกจำนวนเงินให้ถูกต้อง");
      return;
    }
    addTransaction({ type, amount: numericAmount, category, note, date });
    router.push("/");
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

        {error && <p className="text-sm text-[var(--color-expense)]">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
        >
          บันทึกรายการ
        </button>
      </form>
    </div>
  );
}
