"use client";

import { useMemo, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Calendar, CalendarRange } from "lucide-react";
import { useData } from "@/lib/data-store";
import {
  formatCurrency,
  formatDate,
  monthRange,
  isWithinRange,
  THAI_MONTHS_FULL,
  toBuddhistYear,
  todayISO,
} from "@/lib/utils";
import SummaryCard from "@/components/SummaryCard";
import TransactionRow from "@/components/TransactionRow";

type Mode = "month" | "range";

export default function SummaryPage() {
  const { transactions } = useData();

  const now = new Date();
  const [mode, setMode] = useState<Mode>("month");
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [rangeStart, setRangeStart] = useState(monthRange(now.getFullYear(), now.getMonth()).start);
  const [rangeEnd, setRangeEnd] = useState(todayISO());

  const { start, end, periodLabel } = useMemo(() => {
    if (mode === "month") {
      const r = monthRange(selectedYear, selectedMonth);
      return {
        start: r.start,
        end: r.end,
        periodLabel: `${THAI_MONTHS_FULL[selectedMonth]} ${toBuddhistYear(selectedYear)}`,
      };
    }
    return {
      start: rangeStart,
      end: rangeEnd,
      periodLabel: `${formatDate(rangeStart)} – ${formatDate(rangeEnd)}`,
    };
  }, [mode, selectedYear, selectedMonth, rangeStart, rangeEnd]);

  const filtered = useMemo(
    () => transactions.filter((t) => isWithinRange(t.date, start, end)),
    [transactions, start, end]
  );

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const byCategory = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    for (const t of filtered) {
      const entry = map.get(t.category) || { income: 0, expense: 0 };
      if (t.type === "income") entry.income += t.amount;
      else entry.expense += t.amount;
      map.set(t.category, entry);
    }
    return Array.from(map.entries())
      .map(([category, v]) => ({ category, ...v, total: v.income + v.expense }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  function goToMonth(delta: number) {
    let m = selectedMonth + delta;
    let y = selectedYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setSelectedMonth(m);
    setSelectedYear(y);
  }

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
        สรุปรายการ
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        ดูสรุปรายรับ-รายจ่ายตามเดือนหรือช่วงวันที่ที่ต้องการ
      </p>

      {/* ตัวเลือกโหมด */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode("month")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "month"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
          }`}
        >
          <Calendar size={15} />
          เลือกเดือน
        </button>
        <button
          onClick={() => setMode("range")}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            mode === "range"
              ? "bg-[var(--color-primary)] text-white"
              : "bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
          }`}
        >
          <CalendarRange size={15} />
          กำหนดช่วงวันที่
        </button>
      </div>

      {/* ตัวควบคุมช่วงเวลา */}
      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-4 md:p-5 mb-6">
        {mode === "month" ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToMonth(-1)}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-app-bg)]"
              aria-label="เดือนก่อนหน้า"
            >
              ‹
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="flex-1 sm:flex-none rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {THAI_MONTHS_FULL.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {toBuddhistYear(y)}
                </option>
              ))}
            </select>
            <button
              onClick={() => goToMonth(1)}
              className="px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-app-bg)]"
              aria-label="เดือนถัดไป"
            >
              ›
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">จากวันที่</label>
              <input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                max={rangeEnd}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-muted)] mb-1.5">ถึงวันที่</label>
              <input
                type="date"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                min={rangeStart}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        แสดงข้อมูลของ <span className="font-medium text-[var(--color-text-primary)]">{periodLabel}</span>
      </p>

      {/* สรุปยอด 3 ใบ */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          label="คงเหลือ"
          amount={formatCurrency(balance)}
          icon={<Wallet size={22} />}
          tone="neutral"
        />
        <SummaryCard
          label="รายรับรวม"
          amount={formatCurrency(totalIncome)}
          icon={<TrendingUp size={22} />}
          tone="income"
        />
        <SummaryCard
          label="รายจ่ายรวม"
          amount={formatCurrency(totalExpense)}
          icon={<TrendingDown size={22} />}
          tone="expense"
        />
      </section>

      {/* แยกตามหมวดหมู่ */}
      {byCategory.length > 0 && (
        <section className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6 mb-8">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">แยกตามหมวดหมู่</h2>
          <div className="space-y-3">
            {byCategory.map((c) => {
              const maxTotal = byCategory[0].total || 1;
              const widthPct = Math.max(4, (c.total / maxTotal) * 100);
              const isIncome = c.income > 0 && c.expense === 0;
              return (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--color-text-primary)]">{c.category}</span>
                    <span
                      className={`font-medium ${
                        isIncome ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"
                      }`}
                    >
                      {formatCurrency(c.total)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-app-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${widthPct}%`,
                        background: isIncome ? "var(--color-income)" : "var(--color-expense)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* รายการทั้งหมดในช่วงนี้ */}
      <section className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6">
        <h2 className="font-semibold text-[var(--color-text-primary)] mb-2">
          รายการทั้งหมด ({filtered.length})
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-8 text-center">
            ไม่มีรายการในช่วงเวลานี้
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
