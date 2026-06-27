"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Wallet, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { FirebaseError } from "firebase/app";

function getErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      case "auth/invalid-email":
        return "รูปแบบอีเมลไม่ถูกต้อง";
      case "auth/too-many-requests":
        return "ลองผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
      default:
        return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";
    }
  }
  return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-app-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] mb-3">
            <Wallet size={24} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
            บัญชีของฉัน
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            เข้าสู่ระบบเพื่อจัดการบัญชีธุรกิจ
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--color-card-bg)] rounded-2xl border border-[var(--color-border)] p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              อีเมล
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              รหัสผ่าน
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {error && <p className="text-sm text-[var(--color-expense)]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-60 text-white font-medium py-3.5 rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="text-xs text-[var(--color-text-muted)] text-center mt-6">
          ยังไม่มีบัญชี? ติดต่อแอดมินของร้านเพื่อขอรับบัญชีผู้ใช้
        </p>
      </div>
    </div>
  );
}
