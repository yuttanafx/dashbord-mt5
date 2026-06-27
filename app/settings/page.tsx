"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { Upload, X, Check } from "lucide-react";
import { useData } from "@/lib/data-store";

export default function SettingsPage() {
  const { companyProfile, updateCompanyProfile } = useData();
  const [form, setForm] = useState(companyProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // อัปเดตฟอร์มทันทีที่ข้อมูลร้านโหลดมาจาก Firestore สำเร็จ
  useEffect(() => {
    setForm(companyProfile);
  }, [companyProfile]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 700 * 1024) {
      setError("ไฟล์โลโก้ใหญ่เกินไป กรุณาเลือกไฟล์ที่เล็กกว่า 700KB");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setForm((prev) => ({ ...prev, logoDataUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateCompanyProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
        ข้อมูลร้าน/บริษัท
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        ข้อมูลนี้จะแสดงบนใบเสนอราคา ใบแจ้งหนี้ และใบเสร็จรับเงินทุกใบ
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6 space-y-5"
      >
        {/* โลโก้ */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            โลโก้ร้าน
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-app-bg)] flex items-center justify-center overflow-hidden shrink-0">
              {form.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoDataUrl} alt="โลโก้ร้าน" className="w-full h-full object-contain" />
              ) : (
                <Upload size={20} className="text-[var(--color-text-muted)]" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium text-[var(--color-primary)] hover:underline text-left"
              >
                {form.logoDataUrl ? "เปลี่ยนโลโก้" : "อัปโหลดโลโก้"}
              </button>
              {form.logoDataUrl && (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-expense)] inline-flex items-center gap-1 text-left"
                >
                  <X size={14} />
                  ลบโลโก้
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            ชื่อร้าน/บริษัท
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="เช่น ร้านกาแฟดีใจ"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            ที่อยู่
          </label>
          <textarea
            value={form.address}
            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            placeholder="ที่อยู่สำหรับออกเอกสาร"
            rows={2}
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              เลขประจำตัวผู้เสียภาษี (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={form.taxId}
              onChange={(e) => setForm((p) => ({ ...p, taxId: e.target.value }))}
              placeholder="0-0000-00000-00-0"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              เบอร์โทร
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="081-234-5678"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            อีเมล (ไม่บังคับ)
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="contact@example.com"
            className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Check size={18} />
              บันทึกแล้ว
            </>
          ) : (
            "บันทึกข้อมูล"
          )}
        </button>
      </form>
    </div>
  );
}
