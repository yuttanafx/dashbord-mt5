import { formatCurrency, formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE_LABEL } from "@/lib/types";
import { DocumentTemplateProps } from "./types";

export default function BrandedTemplate({ doc, companyProfile, total }: DocumentTemplateProps) {
  return (
    <div className="print-document max-w-[210mm] mx-auto bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
      {/* แถบหัวกระดาษสีฟ้าเข้ม */}
      <div className="bg-[var(--color-primary)] px-10 py-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {companyProfile.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyProfile.logoDataUrl}
              alt={companyProfile.name || "โลโก้ร้าน"}
              className="w-20 h-20 object-contain rounded-xl bg-white/10 p-2 shrink-0"
            />
          ) : null}
          <div>
            <p className="font-bold text-white text-2xl">
              {companyProfile.name || "ชื่อร้าน/บริษัทของคุณ"}
            </p>
            <p className="text-sm text-white/80 mt-1">
              {[companyProfile.phone, companyProfile.email].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <h1 className="text-xl font-bold text-white mb-1">{DOCUMENT_TYPE_LABEL[doc.type]}</h1>
          <p className="text-sm text-white/80">{doc.docNumber}</p>
        </div>
      </div>

      <div className="px-10 py-8">
        {(companyProfile.address || companyProfile.taxId) && (
          <div className="mb-6 text-xs text-[var(--color-text-muted)]">
            {companyProfile.address && <span>{companyProfile.address}</span>}
            {companyProfile.taxId && (
              <span className="ml-3">เลขประจำตัวผู้เสียภาษี: {companyProfile.taxId}</span>
            )}
          </div>
        )}

        {/* ข้อมูลลูกค้า + วันที่ */}
        <div className="grid grid-cols-2 gap-6 mb-8 bg-[var(--color-primary-soft)] rounded-xl p-5">
          <div>
            <p className="text-xs text-[var(--color-primary)] mb-1 font-medium uppercase tracking-wide">
              ลูกค้า
            </p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {doc.clientName}
            </p>
            {doc.clientContact && (
              <p className="text-sm text-[var(--color-text-secondary)]">{doc.clientContact}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-primary)] mb-1 font-medium uppercase tracking-wide">
              วันที่ออกเอกสาร
            </p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {formatDate(doc.issueDate)}
            </p>
            {doc.type !== "receipt" && (
              <>
                <p className="text-xs text-[var(--color-primary)] mt-3 mb-1 font-medium uppercase tracking-wide">
                  {doc.type === "quotation" ? "ยืนราคาถึงวันที่" : "ครบกำหนดชำระ"}
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {formatDate(doc.dueDate)}
                </p>
              </>
            )}
            {doc.type === "receipt" && doc.paidDate && (
              <>
                <p className="text-xs text-[var(--color-primary)] mt-3 mb-1 font-medium uppercase tracking-wide">
                  วันที่รับเงิน
                </p>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {formatDate(doc.paidDate)}
                </p>
              </>
            )}
          </div>
        </div>

        {/* ตารางรายการ */}
        <table className="w-full mb-8 text-sm">
          <thead>
            <tr className="bg-[var(--color-primary)] text-white">
              <th className="text-left py-2.5 px-3 font-semibold rounded-l-lg">รายละเอียด</th>
              <th className="text-center py-2.5 px-3 font-semibold w-20">จำนวน</th>
              <th className="text-right py-2.5 px-3 font-semibold w-28">ราคา/หน่วย</th>
              <th className="text-right py-2.5 px-3 font-semibold w-32 rounded-r-lg">ยอดรวม</th>
            </tr>
          </thead>
          <tbody>
            {doc.items.map((item, idx) => (
              <tr
                key={item.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-[var(--color-app-bg)]"}
              >
                <td className="py-3 px-3 text-[var(--color-text-primary)]">{item.description}</td>
                <td className="py-3 px-3 text-center text-[var(--color-text-secondary)]">
                  {item.quantity}
                </td>
                <td className="py-3 px-3 text-right text-[var(--color-text-secondary)]">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-3 px-3 text-right font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ยอดรวม */}
        <div className="flex justify-end mb-8">
          <div className="w-60 bg-[var(--color-primary)] rounded-xl px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white/90">ยอดรวมทั้งหมด</span>
              <span className="font-bold text-xl text-white">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* วิธีชำระเงิน (ใบเสร็จ) */}
        {doc.type === "receipt" && doc.paymentMethod && (
          <div className="mb-8 text-sm">
            <span className="text-[var(--color-text-muted)]">ชำระโดย: </span>
            <span className="font-medium text-[var(--color-text-primary)]">
              {doc.paymentMethod}
            </span>
          </div>
        )}

        {/* หมายเหตุ */}
        {doc.note && (
          <div className="mb-8 text-sm">
            <p className="text-[var(--color-text-muted)] mb-1">หมายเหตุ</p>
            <p className="text-[var(--color-text-primary)]">{doc.note}</p>
          </div>
        )}

        {/* ลายเซ็น */}
        <div className="grid grid-cols-2 gap-10 mt-16 pt-4">
          <div className="text-center">
            <div className="border-t border-[var(--color-text-muted)] pt-2">
              <p className="text-xs text-[var(--color-text-secondary)]">ผู้รับเอกสาร</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-[var(--color-text-muted)] pt-2">
              <p className="text-xs text-[var(--color-text-secondary)]">ผู้ออกเอกสาร</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
