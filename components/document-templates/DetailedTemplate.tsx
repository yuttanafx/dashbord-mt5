import { formatCurrency, formatDate } from "@/lib/utils";
import { DOCUMENT_TYPE_LABEL } from "@/lib/types";
import { DocumentTemplateProps } from "./types";

export default function DetailedTemplate({ doc, companyProfile, total }: DocumentTemplateProps) {
  return (
    <div className="print-document max-w-[210mm] mx-auto bg-white border border-[var(--color-text-primary)] shadow-sm p-10">
      {/* ส่วนหัว */}
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex items-start gap-3">
          {companyProfile.logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={companyProfile.logoDataUrl}
              alt={companyProfile.name || "โลโก้ร้าน"}
              className="w-14 h-14 object-contain shrink-0"
            />
          )}
          <div>
            <p className="font-bold text-[var(--color-text-primary)] text-base">
              {companyProfile.name || "ชื่อร้าน/บริษัทของคุณ"}
            </p>
            {companyProfile.address && (
              <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-line max-w-xs">
                {companyProfile.address}
              </p>
            )}
            <p className="text-xs text-[var(--color-text-secondary)]">
              {[companyProfile.phone, companyProfile.email].filter(Boolean).join(" · ")}
            </p>
            {companyProfile.taxId && (
              <p className="text-xs text-[var(--color-text-muted)]">
                เลขประจำตัวผู้เสียภาษี: {companyProfile.taxId}
              </p>
            )}
          </div>
        </div>
        <div className="text-right shrink-0 border-2 border-[var(--color-text-primary)] px-4 py-2">
          <h1 className="text-lg font-bold text-[var(--color-text-primary)]">
            {DOCUMENT_TYPE_LABEL[doc.type]}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">เลขที่ {doc.docNumber}</p>
        </div>
      </div>

      {/* ข้อมูลลูกค้า + วันที่ ในกรอบตาราง */}
      <table className="w-full mb-4 text-xs border border-[var(--color-text-primary)]">
        <tbody>
          <tr className="border-b border-[var(--color-text-primary)]">
            <td className="py-1.5 px-2 font-semibold w-1/4 border-r border-[var(--color-text-primary)] bg-[var(--color-app-bg)]">
              ลูกค้า
            </td>
            <td className="py-1.5 px-2 w-1/4 border-r border-[var(--color-text-primary)]">
              {doc.clientName}
            </td>
            <td className="py-1.5 px-2 font-semibold w-1/4 border-r border-[var(--color-text-primary)] bg-[var(--color-app-bg)]">
              วันที่ออกเอกสาร
            </td>
            <td className="py-1.5 px-2 w-1/4">{formatDate(doc.issueDate)}</td>
          </tr>
          <tr>
            <td className="py-1.5 px-2 font-semibold border-r border-[var(--color-text-primary)] bg-[var(--color-app-bg)]">
              ติดต่อ
            </td>
            <td className="py-1.5 px-2 border-r border-[var(--color-text-primary)]">
              {doc.clientContact || "-"}
            </td>
            <td className="py-1.5 px-2 font-semibold border-r border-[var(--color-text-primary)] bg-[var(--color-app-bg)]">
              {doc.type === "quotation"
                ? "ยืนราคาถึงวันที่"
                : doc.type === "receipt"
                ? "วันที่รับเงิน"
                : "ครบกำหนดชำระ"}
            </td>
            <td className="py-1.5 px-2">
              {doc.type === "receipt"
                ? doc.paidDate
                  ? formatDate(doc.paidDate)
                  : "-"
                : formatDate(doc.dueDate)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ตารางรายการ - มีเลขลำดับ */}
      <table className="w-full mb-4 text-xs border border-[var(--color-text-primary)]">
        <thead>
          <tr className="bg-[var(--color-app-bg)] border-b border-[var(--color-text-primary)]">
            <th className="text-center py-2 px-2 font-semibold border-r border-[var(--color-text-primary)] w-10">
              ลำดับ
            </th>
            <th className="text-left py-2 px-2 font-semibold border-r border-[var(--color-text-primary)]">
              รายละเอียด
            </th>
            <th className="text-center py-2 px-2 font-semibold border-r border-[var(--color-text-primary)] w-16">
              จำนวน
            </th>
            <th className="text-right py-2 px-2 font-semibold border-r border-[var(--color-text-primary)] w-24">
              ราคา/หน่วย
            </th>
            <th className="text-right py-2 px-2 font-semibold w-28">ยอดรวม</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item, idx) => (
            <tr key={item.id} className="border-b border-[var(--color-border)]">
              <td className="py-2 px-2 text-center border-r border-[var(--color-border)]">
                {idx + 1}
              </td>
              <td className="py-2 px-2 border-r border-[var(--color-border)]">
                {item.description}
              </td>
              <td className="py-2 px-2 text-center border-r border-[var(--color-border)]">
                {item.quantity}
              </td>
              <td className="py-2 px-2 text-right border-r border-[var(--color-border)]">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="py-2 px-2 text-right font-medium">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
          {/* แถวเปล่าเพิ่มความเป็นทางการแบบเอกสารราชการ/บริษัท */}
          {Array.from({ length: Math.max(0, 3 - doc.items.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="border-b border-[var(--color-border)]">
              <td className="py-2 px-2 border-r border-[var(--color-border)]">&nbsp;</td>
              <td className="py-2 px-2 border-r border-[var(--color-border)]"></td>
              <td className="py-2 px-2 border-r border-[var(--color-border)]"></td>
              <td className="py-2 px-2 border-r border-[var(--color-border)]"></td>
              <td className="py-2 px-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ยอดรวม */}
      <div className="flex justify-end mb-6">
        <table className="text-xs border border-[var(--color-text-primary)] w-60">
          <tbody>
            <tr>
              <td className="py-2 px-3 font-bold border-r border-[var(--color-text-primary)] bg-[var(--color-app-bg)]">
                ยอดรวมทั้งหมด
              </td>
              <td className="py-2 px-3 text-right font-bold">{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* วิธีชำระเงิน (ใบเสร็จ) */}
      {doc.type === "receipt" && doc.paymentMethod && (
        <div className="mb-6 text-xs">
          <span className="text-[var(--color-text-muted)]">ชำระโดย: </span>
          <span className="font-medium text-[var(--color-text-primary)]">{doc.paymentMethod}</span>
        </div>
      )}

      {/* หมายเหตุ */}
      {doc.note && (
        <div className="mb-6 text-xs border border-[var(--color-border)] p-3">
          <p className="text-[var(--color-text-muted)] mb-1">หมายเหตุ</p>
          <p className="text-[var(--color-text-primary)]">{doc.note}</p>
        </div>
      )}

      {/* ลายเซ็น */}
      <div className="grid grid-cols-2 gap-10 mt-12 pt-6 text-xs">
        <div className="text-center">
          <div className="border-t border-[var(--color-text-primary)] pt-2 mx-6">
            <p className="text-[var(--color-text-secondary)]">ผู้รับเอกสาร</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-[var(--color-text-primary)] pt-2 mx-6">
            <p className="text-[var(--color-text-secondary)]">ผู้ออกเอกสาร</p>
          </div>
        </div>
      </div>
    </div>
  );
}
