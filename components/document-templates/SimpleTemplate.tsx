import { formatCurrency, formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE_LABEL } from "@/lib/types";
import { DocumentTemplateProps } from "./types";

export default function SimpleTemplate({ doc, companyProfile, total }: DocumentTemplateProps) {
  return (
    <div className="print-document max-w-[210mm] mx-auto bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-10">
      {/* ส่วนหัว: โลโก้ + ข้อมูลร้าน + ประเภทเอกสาร */}
      <div className="flex items-start justify-between gap-6 mb-10 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-start gap-4">
          {companyProfile.logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyProfile.logoDataUrl}
              alt={companyProfile.name || "โลโก้ร้าน"}
              className="w-16 h-16 object-contain rounded-lg shrink-0"
            />
          )}
          <div>
            <p className="font-semibold text-[var(--color-text-primary)] text-lg">
              {companyProfile.name || "ชื่อร้าน/บริษัทของคุณ"}
            </p>
            {companyProfile.address && (
              <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line max-w-xs">
                {companyProfile.address}
              </p>
            )}
            <p className="text-sm text-[var(--color-text-secondary)]">
              {[companyProfile.phone, companyProfile.email].filter(Boolean).join(" · ")}
            </p>
            {companyProfile.taxId && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                เลขประจำตัวผู้เสียภาษี: {companyProfile.taxId}
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-1">
            {DOCUMENT_TYPE_LABEL[doc.type]}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{doc.docNumber}</p>
        </div>
      </div>

      {/* ข้อมูลลูกค้า + วันที่ */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
            ลูกค้า
          </p>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{doc.clientName}</p>
          {doc.clientContact && (
            <p className="text-sm text-[var(--color-text-secondary)]">{doc.clientContact}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
            วันที่ออกเอกสาร
          </p>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {formatDate(doc.issueDate)}
          </p>
          {doc.type !== "receipt" && (
            <>
              <p className="text-xs text-[var(--color-text-muted)] mt-3 mb-1 uppercase tracking-wide">
                {doc.type === "quotation" ? "ยืนราคาถึงวันที่" : "ครบกำหนดชำระ"}
              </p>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {formatDate(doc.dueDate)}
              </p>
            </>
          )}
          {doc.type === "receipt" && doc.paidDate && (
            <>
              <p className="text-xs text-[var(--color-text-muted)] mt-3 mb-1 uppercase tracking-wide">
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
          <tr className="border-b-2 border-[var(--color-text-primary)]">
            <th className="text-left py-2 font-semibold text-[var(--color-text-primary)]">
              รายละเอียด
            </th>
            <th className="text-center py-2 font-semibold text-[var(--color-text-primary)] w-20">
              จำนวน
            </th>
            <th className="text-right py-2 font-semibold text-[var(--color-text-primary)] w-28">
              ราคา/หน่วย
            </th>
            <th className="text-right py-2 font-semibold text-[var(--color-text-primary)] w-32">
              ยอดรวม
            </th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item) => (
            <tr key={item.id} className="border-b border-[var(--color-border)]">
              <td className="py-3 text-[var(--color-text-primary)]">{item.description}</td>
              <td className="py-3 text-center text-[var(--color-text-secondary)]">
                {item.quantity}
              </td>
              <td className="py-3 text-right text-[var(--color-text-secondary)]">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="py-3 text-right font-medium text-[var(--color-text-primary)]">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ยอดรวม */}
      <div className="flex justify-end mb-8">
        <div className="w-56">
          <div className="flex items-center justify-between py-2 border-t-2 border-[var(--color-text-primary)]">
            <span className="font-semibold text-[var(--color-text-primary)]">ยอดรวมทั้งหมด</span>
            <span className="font-bold text-lg text-[var(--color-text-primary)]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      {/* วิธีชำระเงิน (ใบเสร็จ) */}
      {doc.type === "receipt" && doc.paymentMethod && (
        <div className="mb-8 text-sm">
          <span className="text-[var(--color-text-muted)]">ชำระโดย: </span>
          <span className="font-medium text-[var(--color-text-primary)]">{doc.paymentMethod}</span>
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
      <div className="grid grid-cols-2 gap-10 mt-16 pt-8">
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
  );
}
