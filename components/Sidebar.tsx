"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ListPlus,
  ListOrdered,
  FileText,
  Wallet,
  Settings,
  LogOut,
  BarChart3,
  Package,
  ShoppingCart,
  Truck,
  ClipboardList,
  Inbox,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-store";

const mainNavItems = [
  { href: "/", label: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/summary", label: "สรุปรายการ", icon: BarChart3 },
  { href: "/pending-receipts", label: "รอตรวจสอบ", icon: Inbox },
  { href: "/transactions/new", label: "บันทึกรายการใหม่", icon: ListPlus },
  { href: "/transactions", label: "รายการทั้งหมด", icon: ListOrdered },
  { href: "/documents", label: "เอกสาร", icon: FileText },
];

const inventoryNavItems = [
  { href: "/cashier", label: "ขายเงินสด", icon: ShoppingCart },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/purchase-orders", label: "ใบสั่งซื้อ", icon: ClipboardList },
  { href: "/suppliers", label: "ซัพพลายเออร์", icon: Truck },
];

const bottomNavItems = [{ href: "/settings", label: "ตั้งค่าร้าน", icon: Settings }];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { products, pendingReceipts } = useData();

  const lowStockCount = products.filter((p) => p.stockQty <= p.lowStockThreshold).length;
  const pendingCount = pendingReceipts.filter((p) => p.status === "pending").length;

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="no-print hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-[var(--color-border)] bg-[var(--color-card-bg)] min-h-screen px-4 py-6">
      <div className="flex items-center gap-2.5 px-3 py-3 mb-6 rounded-xl bg-[var(--color-primary)]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15">
          <Wallet size={20} className="text-white" />
        </div>
        <span className="font-semibold text-white text-lg">
          บัญชีของฉัน
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-app-bg)]"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {href === "/pending-receipts" && pendingCount > 0 && (
                <span className="bg-[var(--color-expense)] text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}

        <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide px-3 mt-4 mb-1">
          จัดซื้อ/สต็อก
        </p>
        {inventoryNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-app-bg)]"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {href === "/products" && lowStockCount > 0 && (
                <span className="bg-[var(--color-expense)] text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {lowStockCount}
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-4">
          {bottomNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-app-bg)]"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-[var(--color-border)] pt-3 mt-3">
        {user?.email && (
          <p className="px-3 text-xs text-[var(--color-text-muted)] mb-2 truncate">
            {user.email}
          </p>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-app-bg)] transition-colors"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
