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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/", label: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/transactions/new", label: "บันทึกรายการใหม่", icon: ListPlus },
  { href: "/transactions", label: "รายการทั้งหมด", icon: ListOrdered },
  { href: "/documents", label: "เอกสาร", icon: FileText },
  { href: "/settings", label: "ตั้งค่าร้าน", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

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

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
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
              {label}
            </Link>
          );
        })}
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
