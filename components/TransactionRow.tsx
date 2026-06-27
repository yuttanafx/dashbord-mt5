import { ArrowDownLeft, ArrowUpRight, Paperclip } from "lucide-react";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === "income";
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`shrink-0 rounded-full p-2 ${
          isIncome
            ? "bg-[var(--color-income-soft)] text-[var(--color-income)]"
            : "bg-[var(--color-expense-soft)] text-[var(--color-expense)]"
        }`}
      >
        {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate flex items-center gap-1.5">
          {tx.note || tx.category}
          {tx.receiptImageUrl && (
            <Paperclip size={12} className="text-[var(--color-text-muted)] shrink-0" />
          )}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {tx.category} · {formatDate(tx.date)}
        </p>
      </div>
      <p
        className={`text-sm font-semibold shrink-0 ${
          isIncome ? "text-[var(--color-income)]" : "text-[var(--color-expense)]"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(tx.amount)}
      </p>
    </div>
  );
}
