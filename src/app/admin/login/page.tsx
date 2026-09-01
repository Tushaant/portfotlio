"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("That password did not match. Set ADMIN_PASSWORD on the server.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0A0A0A] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA]">Private</p>
        <h1 className="mt-2 font-display text-2xl text-white">Portfolio Intelligence</h1>
        <p className="mt-2 text-sm text-[#71717A]">Authenticated operators only. Visitor data is never public.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-6 w-full rounded-xl border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-[#8B5CF6]"
          placeholder="Admin password"
          autoComplete="current-password"
        />
        {error ? <p className="mt-2 text-xs text-[#F472B6]">{error}</p> : null}
        <button type="submit" className="mt-4 w-full rounded-full bg-gradient-to-r from-[#FF3CAC] to-[#8B5CF6] py-2.5 text-sm font-semibold text-white">
          Enter dashboard
        </button>
      </form>
    </main>
  );
}
