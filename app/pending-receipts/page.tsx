"use client";

import { useState } from "react";
import { Check, X, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency } from "@/lib/utils";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  RECEIPT_VALIDITY_LABEL,
  ReceiptValidity,
  TransactionType,
} from "@/lib/types";

const validityStyle: Record<ReceiptValidity, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  valid: { bg: "bg-[var(--color-income-soft)]", text: "text-[var(--color-income)]", icon: CheckCircle2 },
  needs_backup: { bg: "bg-amber-50", text: "text-amber-700", icon: AlertTriangle },
  unclear: { bg: "bg-[var(--color-expense-soft)]", text: "text-[var(--color-expense)]", icon: AlertCircle },
};

export default function PendingReceiptsPage() {
  const { pendingReceipts, confirmPendingReceipt, rejectPendingReceipt } = useData();
  const [editing, setEditing] = useState<Record<string, { type: TransactionType; amount: string; category: string; date: string; note: string }>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const items = pendingReceipts.filter((p) => p.status === "pending");

  function getEditState(id: string) {
    const receipt = pendingReceipts.find((p) => p.id === id);
    if (editing[id]) return editing[id];
    return {
      type: receipt?.suggestedType || "expense",
      amount: String(receipt?.suggestedAmount || 0),
      category: receipt?.suggestedCategory || "อื่นๆ",
      date: receipt?.suggestedDate || new Date().toISOString().slice(0, 10),
      note: receipt?.suggestedNote || "",
    };
  }

  function updateEdit(id: string, patch: Partial<ReturnType<typeof getEditState>>) {
    setEditing((prev) => ({ ...prev, [id]: { ...getEditState(id), ...patch } }));
  }

  async function handleConfirm(id: string) {
    const state = getEditState(id);
    const amount = parseFloat(state.amount);
    if (!amount || amount <= 0) return;
    setProcessingId(id);
    try {
      await confirmPendingReceipt(id, {
        type: state.type,
        amount,
        category: state.category,
        date: state.date,
        note: state.note,
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    if (!confirm("ปฏิเสธรายการนี้ใช่หรือไม่? จะไม่ถูกบันทึกเข้าบัญชี")) return;
    setProcessingId(id);
    try {
      await rejectPendingReceipt(id);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
        รอตรวจสอบ
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        รายการที่ AI วิเคราะห์จากสลิป/ใบเสร็จที่ส่งเข้ากลุ่ม LINE ตรวจสอบและแก้ไขก่อนยืนยันบันทึกเข้าบัญชีจริง
      </p>

      {items.length === 0 ? (
        <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-10 text-center">
          <CheckCircle2 size={28} className="mx-auto text-[var(--color-text-muted)] mb-2" />
          <p className="text-sm text-[var(--color-text-secondary)]">
            ไม่มีรายการรอตรวจสอบในขณะนี้
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((receipt) => {
            const state = getEditState(receipt.id);
            const categories = state.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            const style = validityStyle[receipt.validity];
            const ValidityIcon = style.icon;
            const isProcessing = processingId === receipt.id;

            return (
              <div
                key={receipt.id}
                className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6"
              >
                <div className="grid sm:grid-cols-[8rem_1fr] gap-4">
                  {/* รูปสลิป */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receipt.imageDataUrl}
                    alt="สลิป/ใบเสร็จ"
                    className="w-full sm:w-32 h-32 object-cover rounded-xl border border-[var(--color-border)]"
                  />

                  <div className="min-w-0">
                    {/* แถบประเมินความน่าเชื่อถือ */}
                    <div
                      className={`inline-flex items-center gap-1.5 ${style.bg} ${style.text} text-xs font-medium px-2.5 py-1 rounded-full mb-3`}
                    >
                      <ValidityIcon size={13} />
                      {RECEIPT_VALIDITY_LABEL[receipt.validity]}
                    </div>
                    {receipt.validityReason && (
                      <p className="text-xs text-[var(--color-text-secondary)] mb-3">
                        {receipt.validityReason}
                      </p>
                    )}

                    {/* ฟอร์มแก้ไขก่อนยืนยัน */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="col-span-2 grid grid-cols-2 gap-2 p-1 bg-[var(--color-app-bg)] rounded-lg w-fit">
                        {(["income", "expense"] as TransactionType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() =>
                              updateEdit(receipt.id, {
                                type: t,
                                category: t === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
                              })
                            }
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                              state.type === t
                                ? t === "income"
                                  ? "bg-[var(--color-income)] text-white"
                                  : "bg-[var(--color-expense)] text-white"
                                : "text-[var(--color-text-secondary)]"
                            }`}
                          >
                            {t === "income" ? "รายรับ" : "รายจ่าย"}
                          </button>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                          จำนวนเงิน
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={state.amount}
                          onChange={(e) => updateEdit(receipt.id, { amount: e.target.value })}
                          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                          วันที่
                        </label>
                        <input
                          type="date"
                          value={state.date}
                          onChange={(e) => updateEdit(receipt.id, { date: e.target.value })}
                          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                          หมวดหมู่
                        </label>
                        <select
                          value={state.category}
                          onChange={(e) => updateEdit(receipt.id, { category: e.target.value })}
                          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                          บันทึกเพิ่มเติม
                        </label>
                        <input
                          type="text"
                          value={state.note}
                          onChange={(e) => updateEdit(receipt.id, { note: e.target.value })}
                          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(receipt.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-app-bg)] disabled:opacity-60"
                      >
                        <X size={14} />
                        ปฏิเสธ
                      </button>
                      <button
                        onClick={() => handleConfirm(receipt.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium disabled:opacity-60"
                      >
                        <Check size={14} />
                        {isProcessing ? "กำลังบันทึก..." : "ยืนยันบันทึกเข้าบัญชี"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
