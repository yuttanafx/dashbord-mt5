"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { DataProvider } from "@/lib/data-store";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

const PUBLIC_ROUTES = ["/login"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPrintRoute = pathname.includes("/print");

  if (isPublicRoute) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <AuthGuard>
        <DataProvider>
          {isPrintRoute ? (
            children
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 pb-20 md:pb-0">{children}</main>
            </div>
          )}
          {!isPrintRoute && <MobileNav />}
        </DataProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
