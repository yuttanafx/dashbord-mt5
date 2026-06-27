"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const THAI_MONTHS_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

interface MonthlyDatum {
  key: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

function buildMonthlyData(transactions: Transaction[], monthsBack: number): MonthlyDatum[] {
  const now = new Date();
  const buckets: MonthlyDatum[] = [];

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    buckets.push({
      key,
      label: `${THAI_MONTHS_SHORT[d.getMonth()]} ${String(d.getFullYear() + 543).slice(-2)}`,
      income: 0,
      expense: 0,
      net: 0,
    });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = byKey.get(key);
    if (!bucket) continue;
    if (tx.type === "income") bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  buckets.forEach((b) => (b.net = b.income - b.expense));
  return buckets;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data: MonthlyDatum = payload[0].payload;
  return (
    <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-[var(--color-text-primary)] mb-1">{label}</p>
      <p className="text-[var(--color-income)]">รายรับ {formatCurrency(data.income)}</p>
      <p className="text-[var(--color-expense)]">รายจ่าย {formatCurrency(data.expense)}</p>
      <p className="text-[var(--color-text-primary)] font-medium mt-1">
        คงเหลือ {formatCurrency(data.net)}
      </p>
    </div>
  );
}

export default function MonthlyChart({ transactions }: { transactions: Transaction[] }) {
  const [range, setRange] = useState<6 | 12>(6);

  const data = useMemo(() => buildMonthlyData(transactions, range), [transactions, range]);

  return (
    <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[var(--color-text-primary)]">สรุปยอดเงินรายเดือน</h2>
        <div className="flex gap-1 p-1 bg-[var(--color-app-bg)] rounded-full">
          {[6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setRange(m as 6 | 12)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                range === m
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              {m} เดือน
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-primary-soft)" }} />
            <Bar dataKey="net" radius={[6, 6, 0, 0]} maxBarSize={28}>
              {data.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={entry.net >= 0 ? "var(--color-chart-bar)" : "var(--color-expense)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
