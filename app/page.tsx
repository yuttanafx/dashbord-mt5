"use client";

import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, Plus, FileText, Loader2 } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency } from "@/lib/utils";
import SummaryCard from "@/components/SummaryCard";
import TransactionRow from "@/components/TransactionRow";

export default function DashboardPage() {
  const { transactions, loading } = useData();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const recent = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          สวัสดีครับ 👋
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          นี่คือภาพรวมการเงินของธุรกิจคุณ
        </p>
      </header>

      {/* สรุปยอด 3 ใบ */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          label="คงเหลือ"
          amount={formatCurrency(balance)}
          icon={<Wallet size={22} />}
          tone="neutral"
        />
        <SummaryCard
          label="รายรับทั้งหมด"
          amount={formatCurrency(totalIncome)}
          icon={<TrendingUp size={22} />}
          tone="income"
        />
        <SummaryCard
          label="รายจ่ายทั้งหมด"
          amount={formatCurrency(totalExpense)}
          icon={<TrendingDown size={22} />}
          tone="expense"
        />
      </section>

      {/* ปุ่มลัด */}
      <section className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/transactions/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium text-sm px-5 py-3 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={18} />
          บันทึกรายการใหม่
        </Link>
        <Link
          href="/documents/new?type=quotation"
          className="inline-flex items-center gap-2 bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-primary)] font-medium text-sm px-5 py-3 rounded-xl shadow-sm transition-colors"
        >
          <FileText size={18} />
          ออกใบเสนอราคา/ใบแจ้งหนี้
        </Link>
      </section>

      {/* รายการล่าสุด */}
      <section className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            รายการล่าสุด
          </h2>
          <Link
            href="/transactions"
            className="text-sm text-[var(--color-primary)] font-medium hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-8 text-center">
            ยังไม่มีรายการ เริ่มบันทึกรายการแรกของคุณได้เลย
          </p>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {recent.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
