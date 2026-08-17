"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setupTotp, verifyTotp } from "@/lib/auth";
import { ApiError } from "@/lib/apiClient";

export default function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get("setup") === "1";
  const challengeToken = searchParams.get("challengeToken");
  const next = searchParams.get("next") ?? "/dashboard";

  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSetup) return;
    setupTotp()
      .then((result) => setQrCode(result.qrCodeDataUrl))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível iniciar o 2FA."));
  }, [isSetup]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await verifyTotp({ challengeToken: challengeToken ?? undefined, code });
      router.push(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Código inválido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl w-full max-w-sm border border-line bg-surface p-8">
      <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">
        {isSetup ? "Configuração" : "Verificação"}
      </p>
      <h1 className="mt-1 font-display text-2xl font-medium">Autenticação em duas etapas</h1>

      {isSetup && (
        <div className="mt-6 flex flex-col items-center gap-2">
          {qrCode ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrCode}
              alt="QR code para configurar o app autenticador"
              className="h-40 w-40 border border-line bg-ink p-2"
            />
          ) : (
            <div className="h-40 w-40 animate-pulse border border-line bg-ink" />
          )}
          <p className="font-mono text-xs text-foreground-dim text-center">
            Escaneie com Microsoft Authenticator, Google Authenticator ou Authy
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-xs uppercase tracking-wider text-foreground-dim">
            Código de 6 dígitos
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            className="rounded-lg border border-line bg-ink px-3 py-2 text-center font-mono text-lg tracking-[0.5em] outline-none focus:border-cyan"
          />
        </label>

        {error && <p className="border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || code.length !== 6}
          className="mt-2 rounded-lg bg-cyan px-5 py-2.5 font-display text-sm font-medium text-ink disabled:opacity-40"
        >
          {isSubmitting ? "Verificando…" : "Verificar"}
        </button>
      </form>
    </div>
  );
}
