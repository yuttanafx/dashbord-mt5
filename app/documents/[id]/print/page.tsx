"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import { useData } from "@/lib/data-store";
import { documentTotal } from "@/lib/utils";
import { downloadElementAsPdf } from "@/lib/pdf-export";
import SimpleTemplate from "@/components/document-templates/SimpleTemplate";
import BrandedTemplate from "@/components/document-templates/BrandedTemplate";
import DetailedTemplate from "@/components/document-templates/DetailedTemplate";

export default function PrintDocumentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { documents, companyProfile } = useData();
  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

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

  async function handleDownloadPdf() {
    if (!docRef.current || !doc) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const filename = `${doc.docNumber}.pdf`;
      await downloadElementAsPdf(docRef.current, filename);
    } catch {
      setDownloadError("สร้างไฟล์ PDF ไม่สำเร็จ กรุณาลองใหม่ หรือใช้ปุ่มพิมพ์แทน");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-[var(--color-app-bg)] min-h-screen py-8 px-4">
      {/* แถบปุ่มควบคุม - ซ่อนตอนพิมพ์ */}
      <div className="no-print max-w-[210mm] mx-auto mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <ArrowLeft size={16} />
            กลับ
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              {downloading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {downloading ? "กำลังสร้างไฟล์..." : "ดาวน์โหลด PDF"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-card-bg)] text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <Printer size={16} />
              พิมพ์
            </button>
          </div>
        </div>
        {downloadError && (
          <p className="text-sm text-[var(--color-expense)] mt-2 text-right">{downloadError}</p>
        )}
      </div>

      {/* ตัวเอกสารจริงที่จะพิมพ์ - เลือกเทมเพลตตามที่ตั้งค่าไว้ */}
      <div ref={docRef}>
        {template === "branded" ? (
          <BrandedTemplate doc={doc} companyProfile={companyProfile} total={total} />
        ) : template === "detailed" ? (
          <DetailedTemplate doc={doc} companyProfile={companyProfile} total={total} />
        ) : (
          <SimpleTemplate doc={doc} companyProfile={companyProfile} total={total} />
        )}
      </div>
    </div>
  );
}
