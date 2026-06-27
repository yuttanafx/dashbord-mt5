"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { useData } from "@/lib/data-store";
import { documentTotal } from "@/lib/utils";
import SimpleTemplate from "@/components/document-templates/SimpleTemplate";
import BrandedTemplate from "@/components/document-templates/BrandedTemplate";
import DetailedTemplate from "@/components/document-templates/DetailedTemplate";

export default function PrintDocumentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { documents, companyProfile } = useData();

  const doc = documents.find((d) => d.id === params.id);

  // ตั้งชื่อแท็บให้ตรงกับเลขเอกสาร เพื่อให้ตอน Save as PDF ได้ชื่อไฟล์ที่อ่านง่าย
  useEffect(() => {
    if (doc) {
      document.title = `${doc.docNumber} - ${companyProfile.name || "เอกสาร"}`;
    }
  }, [doc, companyProfile.name]);

  if (!doc) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">ไม่พบเอกสารนี้</p>
        <button
          onClick={() => router.push("/documents")}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          กลับไปหน้าเอกสาร
        </button>
      </div>
    );
  }

  const total = documentTotal(doc.items);
  const template = companyProfile.documentTemplate || "simple";

  return (
    <div className="bg-[var(--color-app-bg)] min-h-screen py-8 px-4">
      {/* แถบปุ่มควบคุม - ซ่อนตอนพิมพ์ */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} />
          กลับ
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Printer size={16} />
          พิมพ์ / บันทึกเป็น PDF
        </button>
      </div>

      {/* ตัวเอกสารจริงที่จะพิมพ์ - เลือกเทมเพลตตามที่ตั้งค่าไว้ */}
      {template === "branded" ? (
        <BrandedTemplate doc={doc} companyProfile={companyProfile} total={total} />
      ) : template === "detailed" ? (
        <DetailedTemplate doc={doc} companyProfile={companyProfile} total={total} />
      ) : (
        <SimpleTemplate doc={doc} companyProfile={companyProfile} total={total} />
      )}
    </div>
  );
}
