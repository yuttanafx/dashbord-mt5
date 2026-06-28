"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useData } from "@/lib/data-store";

export default function NewSupplierPage() {
  const router = useRouter();
  const { addSupplier } = useData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณากรอกชื่อซัพพลายเออร์");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await addSupplier({ name: name.trim(), phone: phone.trim(), address: address.trim(), note: note.trim() });
      router.push("/suppliers");
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

      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">เพิ่มซัพพลายเออร์</h1>

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
            placeholder="เช่น บริษัท วัตถุดิบไทย จำกัด"
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
            placeholder="081-234-5678"
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
          {submitting ? "กำลังบันทึก..." : "บันทึกซัพพลายเออร์"}
        </button>
      </form>
    </div>
  );
}
