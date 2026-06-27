"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListPlus, ListOrdered, FileText, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", label: "หน้าหลัก", icon: LayoutDashboard },
  { href: "/summary", label: "สรุป", icon: BarChart3 },
  { href: "/transactions/new", label: "บันทึก", icon: ListPlus },
  { href: "/transactions", label: "รายการ", icon: ListOrdered },
  { href: "/documents", label: "เอกสาร", icon: FileText },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-20 bg-[var(--color-card-bg)] border-t border-[var(--color-border)] flex items-stretch">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium ${
              isActive
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
