"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, CheckCircle2, PackageCheck } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency, formatDate, documentTotal } from "@/lib/utils";
import { PO_STATUS_LABEL, PurchaseOrderStatus } from "@/lib/types";

const statusStyle: Record<PurchaseOrderStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
  received: "bg-[var(--color-income-soft)] text-[var(--color-income)]",
  cancelled: "bg-[var(--color-expense-soft)] text-[var(--color-expense)]",
};

export default function PurchaseOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { purchaseOrders, updatePurchaseOrderStatus, deletePurchaseOrder, receivePurchaseOrder } =
    useData();

  const po = purchaseOrders.find((p) => p.id === params.id);
  const [receivedQty, setReceivedQty] = useState<Record<string, string>>({});
  const [receiving, setReceiving] = useState(false);
  const [showReceiveForm, setShowReceiveForm] = useState(false);

  if (!po) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">ไม่พบใบสั่งซื้อนี้</p>
        <button
          onClick={() => router.push("/purchase-orders")}
          className="text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          กลับไปหน้าใบสั่งซื้อ
        </button>
      </div>
    );
  }

  const poId = po.id;
  const total = documentTotal(po.items.map((it) => ({ ...it, unitPrice: it.unitCost })));

  async function handleDelete() {
    if (!confirm(`ลบใบสั่งซื้อ "${po!.poNumber}" ใช่หรือไม่?`)) return;
    await deletePurchaseOrder(poId);
    router.push("/purchase-orders");
  }

  function startReceiveForm() {
    const initial: Record<string, string> = {};
    po!.items.forEach((it) => {
      initial[it.id] = String(it.quantity);
    });
    setReceivedQty(initial);
    setShowReceiveForm(true);
  }

  async function handleReceive() {
    setReceiving(true);
    const items = po!.items.map((it) => ({
      itemId: it.id,
      quantityReceived: parseInt(receivedQty[it.id] || "0", 10) || 0,
    }));
    const gr = await receivePurchaseOrder(poId, items);
    setReceiving(false);
    if (gr) {
      router.push(`/purchase-orders/${poId}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/purchase-orders")}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} />
          กลับไปหน้าใบสั่งซื้อ
        </button>
        {po.status !== "received" && (
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-expense)] hover:underline"
          >
            <Trash2 size={14} />
            ลบ
          </button>
        )}
      </div>

      <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-6 md:p-8 mb-4">
        <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{po.poNumber}</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              สั่งวันที่ {formatDate(po.orderDate)} · คาดว่าจะได้รับ {formatDate(po.expectedDate)}
            </p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[po.status]}`}>
            {PO_STATUS_LABEL[po.status]}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-xs text-[var(--color-text-muted)] mb-1">ซัพพลายเออร์</p>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">{po.supplierName}</p>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-[var(--color-text-muted)] mb-2 px-1">
            <span>สินค้า</span>
            <span className="text-center">จำนวนสั่ง</span>
            <span className="text-right">ราคารวม</span>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {po.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-2 py-2.5 px-1 text-sm">
                <span className="text-[var(--color-text-primary)]">{item.productName}</span>
                <span className="text-center text-[var(--color-text-secondary)]">
                  {item.quantity} {item.unit}
                </span>
                <span className="text-right font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(item.quantity * item.unitCost)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--color-border)]">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">ยอดรวมทั้งหมด</span>
          <span className="text-2xl font-semibold text-[var(--color-text-primary)]">
            {formatCurrency(total)}
          </span>
        </div>

        {po.note && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-4 pt-4 border-t border-[var(--color-border)]">
            หมายเหตุ: {po.note}
          </p>
        )}
      </div>

      {/* Workflow ตามสถานะ */}
      {po.status === "draft" && (
        <button
          onClick={() => updatePurchaseOrderStatus(poId, "pending_approval")}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors"
        >
          ส่งขออนุมัติ
        </button>
      )}

      {po.status === "pending_approval" && (
        <button
          onClick={() => updatePurchaseOrderStatus(poId, "approved")}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} />
          อนุมัติใบสั่งซื้อนี้
        </button>
      )}

      {po.status === "approved" && !showReceiveForm && (
        <button
          onClick={startReceiveForm}
          className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2"
        >
          <PackageCheck size={18} />
          รับสินค้าเข้าสต็อก
        </button>
      )}

      {po.status === "approved" && showReceiveForm && (
        <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 md:p-6">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4">
            ยืนยันจำนวนที่รับจริง
          </h2>
          <div className="space-y-3 mb-5">
            {po.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-[var(--color-text-primary)]">
                  {item.productName}
                  <span className="text-[var(--color-text-muted)]"> (สั่ง {item.quantity} {item.unit})</span>
                </span>
                <input
                  type="number"
                  min="0"
                  value={receivedQty[item.id] || ""}
                  onChange={(e) =>
                    setReceivedQty((prev) => ({ ...prev, [item.id]: e.target.value }))
                  }
                  className="w-24 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <span className="text-xs text-[var(--color-text-muted)] w-10">{item.unit}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">
            จำนวนที่รับจริงจะถูกเพิ่มเข้าสต็อกสินค้าทันทีที่ยืนยัน
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowReceiveForm(false)}
              className="flex-1 border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium py-3 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleReceive}
              disabled={receiving}
              className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white font-medium py-3 rounded-xl"
            >
              {receiving ? "กำลังบันทึก..." : "ยืนยันรับสินค้า"}
            </button>
          </div>
        </div>
      )}

      {po.status === "received" && (
        <p className="text-center text-sm text-[var(--color-text-muted)] inline-flex items-center justify-center gap-1.5 w-full">
          <CheckCircle2 size={14} />
          รับสินค้าเข้าสต็อกเรียบร้อยแล้ว
        </p>
      )}
    </div>
  );
}
