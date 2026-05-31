"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ensureDefaultCompany } from "@/lib/supabase/auth";

export default function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await ensureDefaultCompany(email);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-stone-950 flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="w-full max-w-md border border-stone-200 bg-white p-8 rounded-2xl space-y-6">
        <div>
          <p className="text-[10px] font-mono tracking-[0.4em] text-stone-400 uppercase">Octo Login</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Welcome back.</h1>
          <p className="mt-3 text-sm text-stone-500">Log in to your AI company workspace.</p>
        </div>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-950"
        />

        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-950"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-stone-950 py-3 text-sm font-semibold text-white disabled:bg-stone-300"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="w-full text-sm text-stone-500 hover:text-stone-950"
        >
          Create account
        </button>
      </form>
    </main>
  );
}
