import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

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
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
