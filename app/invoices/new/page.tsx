"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useData } from "@/lib/data-store";
import { InvoiceItem } from "@/lib/types";
import { formatCurrency, todayISO } from "@/lib/utils";

function generateLineId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function nextDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { invoices, addInvoice } = useData();

  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [issueDate, setIssueDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState(nextDueDate());
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: generateLineId(), description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [error, setError] = useState("");

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function updateItem(id: string, patch: Partial<InvoiceItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { id: generateLineId(), description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) {
      setError("กรุณากรอกชื่อลูกค้า");
      return;
    }
    if (items.some((it) => !it.description.trim() || it.unitPrice <= 0)) {
      setError("กรุณากรอกรายละเอียดและราคาในแต่ละรายการให้ครบ");
      return;
    }

    const invoiceNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`;
    addInvoice({
      invoiceNumber,
      clientName,
      clientContact,
      issueDate,
      dueDate,
      items,
      status: "draft",
      note: "",
    });
    router.push("/invoices");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6"
      >
        <ArrowLeft size={16} />
        กลับ
      </button>

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">
        สร้างใบแจ้งหนี้
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6 space-y-6"
      >
        {/* ข้อมูลลูกค้า */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              ชื่อลูกค้า
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="บริษัท / ชื่อลูกค้า"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              ช่องทางติดต่อ (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={clientContact}
              onChange={(e) => setClientContact(e.target.value)}
              placeholder="เบอร์โทร / อีเมล"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              วันที่ออกใบแจ้งหนี้
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              ครบกำหนดชำระ
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* รายการสินค้า/บริการ */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            รายการสินค้า/บริการ
          </label>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 items-start">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="รายละเอียด"
                  className="flex-1 min-w-0 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="จำนวน"
                  className="w-16 rounded-xl border border-[var(--color-border)] px-2 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="ราคา/หน่วย"
                  className="w-24 rounded-xl border border-[var(--color-border)] px-2 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="ลบรายการนี้"
                  className="p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-expense)] transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            <Plus size={14} />
            เพิ่มรายการ
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">ยอดรวม</span>
          <span className="text-xl font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(total)}
          </span>
        </div>

        {error && <p className="text-sm text-[var(--color-expense)]">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
        >
          สร้างใบแจ้งหนี้
        </button>
      </form>
    </div>
  );
}
