"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/apiClient";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      const next = searchParams.get("next");
      router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl w-full max-w-sm border border-line bg-surface p-8">
      <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">Acesso</p>
      <h1 className="mt-1 font-display text-2xl font-medium">Entrar na fábrica</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-wider text-foreground-dim">E-mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-wider text-foreground-dim">Senha</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
          />
        </label>

        {error && <p className="border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-cyan px-5 py-2.5 font-display text-sm font-medium text-ink disabled:opacity-40"
        >
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 font-mono text-xs text-foreground-dim">
        Novo por aqui?{" "}
        <Link href="/register" className="text-cyan-deep hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
