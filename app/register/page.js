"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/auth";
import { ApiError } from "@/lib/apiClient";
import BrandMotif from "@/components/BrandMotif";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function updateField(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await register(form);
      router.push("/2fa?setup=1");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
      <BrandMotif className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 opacity-[0.06] dark:opacity-[0.1]" />

      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">Cadastro</p>
        <h1 className="mt-1 font-display text-2xl font-medium">Criar conta</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-foreground-dim">Nome</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={updateField("name")}
              className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-foreground-dim">E-mail</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={updateField("email")}
              className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wider text-foreground-dim">Senha</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={updateField("password")}
              className="rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-cyan"
            />
          </label>

          {error && <p className="border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-cyan px-5 py-2.5 font-display text-sm font-medium text-ink disabled:opacity-40"
          >
            {isSubmitting ? "Criando…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 font-mono text-xs text-foreground-dim">
          Já tem conta?{" "}
          <Link href="/login" className="text-cyan-deep hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
