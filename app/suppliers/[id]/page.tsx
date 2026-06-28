"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useData } from "@/lib/data-store";

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { suppliers, updateSupplier, deleteSupplier, purchaseOrders } = useData();

  const supplier = suppliers.find((s) => s.id === params.id);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setPhone(supplier.phone);
      setAddress(supplier.address);
      setNote(supplier.note || "");
    }
  }, [supplier]);

  if (!supplier) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">ไม่พบซัพพลายเออร์นี้</p>
        <button
          onClick={() => router.push("/suppliers")}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          กลับไปหน้าซัพพลายเออร์
        </button>
      </div>
    );
  }

  const supplierId = supplier.id;
  const supplierName = supplier.name;
  const relatedPOCount = purchaseOrders.filter((po) => po.supplierId === supplierId).length;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณากรอกชื่อซัพพลายเออร์");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await updateSupplier(supplierId, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        note: note.trim(),
      });
      router.push("/suppliers");
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`ลบซัพพลายเออร์ "${supplierName}" ใช่หรือไม่?`)) return;
    await deleteSupplier(supplierId);
    router.push("/suppliers");
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
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">แก้ไขซัพพลายเออร์</h1>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-expense)] hover:underline"
        >
          <Trash2 size={14} />
          ลบ
        </button>
      </div>

      {relatedPOCount > 0 && (
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          มีใบสั่งซื้อที่เชื่อมกับซัพพลายเออร์นี้ {relatedPOCount} ใบ
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            ชื่อซัพพลายเออร์
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            เบอร์โทร
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            ที่อยู่
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
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
