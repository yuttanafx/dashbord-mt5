"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingCart, Search } from "lucide-react";
import { useData } from "@/lib/data-store";
import { formatCurrency } from "@/lib/utils";
import { CashSaleItem } from "@/lib/types";

export default function CashierPage() {
  const router = useRouter();
  const { products, addCashSale } = useData();

  const [cart, setCart] = useState<CashSaleItem[]>([]);
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  const total = cart.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  function stockAvailableFor(productId: string): number {
    return products.find((p) => p.id === productId)?.stockQty ?? 0;
  }

  function addToCart(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setError("");
    setCart((prev) => {
      const existing = prev.find((it) => it.productId === productId);
      if (existing) {
        if (existing.quantity + 1 > product.stockQty) {
          setError(`สต็อก "${product.name}" มีไม่พอ (เหลือ ${product.stockQty} ${product.unit})`);
          return prev;
        }
        return prev.map((it) =>
          it.productId === productId ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      if (product.stockQty <= 0) {
        setError(`สินค้า "${product.name}" หมดสต็อก`);
        return prev;
      }
      return [
        ...prev,
        {
          id: productId,
          productId,
          productName: product.name,
          unit: product.unit,
          quantity: 1,
          unitPrice: product.sellPrice,
        },
      ];
    });
  }

  function changeQty(productId: string, delta: number) {
    setError("");
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.productId !== productId) return it;
          const newQty = it.quantity + delta;
          const available = stockAvailableFor(productId);
          if (newQty > available) {
            setError(`สต็อก "${it.productName}" มีไม่พอ (เหลือ ${available} ${it.unit})`);
            return it;
          }
          return { ...it, quantity: newQty };
        })
        .filter((it) => it.quantity > 0)
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((it) => it.productId !== productId));
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      setError("กรุณาเลือกสินค้าก่อนทำการขาย");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const sale = await addCashSale(cart, note);
      if (sale) {
        router.push("/transactions");
      }
    } catch {
      setError("บันทึกการขายไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 md:px-8 py-10 text-center">
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          ยังไม่มีสินค้าในระบบ ต้องเพิ่มสินค้าก่อนเริ่มขาย
        </p>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2.5 rounded-xl"
        >
          <Plus size={16} />
          เพิ่มสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-1">
        ขายเงินสด / แคชเชียร์
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">
        เลือกสินค้าเพื่อขาย ระบบจะตัดสต็อกและบันทึกรายรับให้อัตโนมัติ
      </p>

      <div className="grid md:grid-cols-[1fr_22rem] gap-6">
        {/* รายการสินค้า */}
        <div>
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาสินค้า"
              className="w-full rounded-xl border border-[var(--color-border)] pl-10 pr-4 py-2.5 text-sm bg-[var(--color-card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const isOut = p.stockQty <= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p.id)}
                  disabled={isOut}
                  className="text-left bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl p-3 hover:border-[var(--color-primary)] disabled:opacity-50 disabled:hover:border-[var(--color-border)] transition-colors"
                >
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                    {formatCurrency(p.sellPrice)}
                  </p>
                  <p
                    className={`text-xs ${
                      isOut ? "text-[var(--color-expense)]" : "text-[var(--color-text-muted)]"
                    }`}
                  >
                    {isOut ? "หมดสต็อก" : `เหลือ ${p.stockQty} ${p.unit}`}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ตะกร้า */}
        <div className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-5 h-fit sticky top-6">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-4 inline-flex items-center gap-2">
            <ShoppingCart size={18} />
            รายการขาย
          </h2>

          {cart.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-6 text-center">
              ยังไม่มีสินค้าในตะกร้า
            </p>
          ) : (
            <div className="space-y-3 mb-4">
              {cart.map((it) => (
                <div key={it.productId} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {it.productName}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {formatCurrency(it.unitPrice)} / {it.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => changeQty(it.productId, -1)}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm w-6 text-center">{it.quantity}</span>
                  <button
                    onClick={() => changeQty(it.productId, 1)}
                    className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)]"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeFromCart(it.productId)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-expense)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="บันทึกเพิ่มเติม (ไม่บังคับ)"
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />

          <div className="flex items-center justify-between mb-4 pt-3 border-t border-[var(--color-border)]">
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">ยอดรวม</span>
            <span className="text-xl font-bold text-[var(--color-text-primary)]">
              {formatCurrency(total)}
            </span>
          </div>

          {error && <p className="text-xs text-[var(--color-expense)] mb-3">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={submitting || cart.length === 0}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white font-medium py-3 rounded-xl shadow-sm transition-colors"
          >
            {submitting ? "กำลังบันทึก..." : "ยืนยันการขาย"}
          </button>
        </div>
      </div>
    </div>
  );
}
