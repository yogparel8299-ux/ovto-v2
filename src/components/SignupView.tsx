"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ensureDefaultCompany } from "@/lib/supabase/auth";

export default function SignupView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split("@")[0],
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await ensureDefaultCompany(companyName || email);
      router.push("/dashboard");
      return;
    }

    setMessage("Account created. Check your email if Supabase asks for confirmation, then login.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] text-stone-950 flex items-center justify-center px-6">
      <form onSubmit={handleSignup} className="w-full max-w-md border border-stone-200 bg-white p-8 rounded-2xl space-y-6">
        <div>
          <p className="text-[10px] font-mono tracking-[0.4em] text-stone-400 uppercase">Octo Signup</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Create your AI company.</h1>
          <p className="mt-3 text-sm text-stone-500">Start building AI workers, teams, and workflows.</p>
        </div>

        <input
          type="text"
          placeholder="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-950"
        />

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
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-950"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-emerald-700">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-stone-950 py-3 text-sm font-semibold text-white disabled:bg-stone-300"
        >
          {loading ? "Creating..." : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full text-sm text-stone-500 hover:text-stone-950"
        >
          Already have an account? Login
        </button>
      </form>
    </main>
  );
}
