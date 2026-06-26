import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/data-store";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: "บัญชีของฉัน",
  description: "โปรแกรมบัญชีอย่างง่ายสำหรับธุรกิจส่วนตัวและ SME",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-app-bg)]">
        <DataProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
          </div>
          <MobileNav />
        </DataProvider>
      </body>
    </html>
  );
}
