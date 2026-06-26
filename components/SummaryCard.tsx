import { ReactNode } from "react";

interface SummaryCardProps {
  label: string;
  amount: string;
  icon: ReactNode;
  tone: "income" | "expense" | "neutral";
}

const toneStyles: Record<SummaryCardProps["tone"], { bg: string; text: string; iconBg: string }> = {
  income: {
    bg: "bg-[var(--color-card-bg)]",
    text: "text-[var(--color-income)]",
    iconBg: "bg-[var(--color-income-soft)]",
  },
  expense: {
    bg: "bg-[var(--color-card-bg)]",
    text: "text-[var(--color-expense)]",
    iconBg: "bg-[var(--color-expense-soft)]",
  },
  neutral: {
    bg: "bg-[var(--color-card-bg)]",
    text: "text-[var(--color-primary)]",
    iconBg: "bg-[var(--color-primary-soft)]",
  },
};

export default function SummaryCard({ label, amount, icon, tone }: SummaryCardProps) {
  const styles = toneStyles[tone];
  return (
    <div
      className={`${styles.bg} rounded-2xl border border-[var(--color-border)] p-5 flex items-center gap-4 shadow-sm`}
    >
      <div className={`${styles.iconBg} ${styles.text} rounded-xl p-3 shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
        <p className={`text-2xl font-semibold ${styles.text} truncate`}>{amount}</p>
      </div>
    </div>
  );
}
