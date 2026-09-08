"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/apiClient";

const STAGE_LABEL = {
  pending: "Recebido",
  received: "Recebido",
  queued: "Na fila",
  processing: "Processando",
  completed: "Pronto",
  done: "Pronto",
  failed: "Falhou",
  error: "Falhou",
};

export default function DashboardPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient
      .get("/reports")
      .then(setReports)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar os relatórios."));
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center p-4 py-16">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">Meus relatórios</p>
            <h1 className="mt-1 font-display text-2xl font-medium">Dashboard</h1>
          </div>
          <Link
            href="/upload"
            className="rounded-lg bg-cyan px-4 py-2 font-display text-sm font-medium text-ink"
          >
            Novo relatório
          </Link>
        </div>

        {error && <p className="mt-6 border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>}

        {!reports && !error && (
          <p className="mt-10 font-mono text-sm text-foreground-dim">Carregando…</p>
        )}

        {reports?.length === 0 && (
          <p className="mt-10 font-mono text-sm text-foreground-dim">
            Nenhum relatório ainda. Envie um arquivo para começar.
          </p>
        )}

        <ul className="mt-8 flex flex-col gap-3">
          {reports?.map((report) => (
            <li key={report.id}>
              <Link
                href={`/dashboard/${report.id}`}
                className="rounded-2xl flex items-center justify-between border border-line bg-surface px-5 py-4 transition-colors hover:border-cyan"
              >
                <div>
                  <p className="font-display text-base font-medium">{report.fileName}</p>
                  <p className="font-mono text-xs text-foreground-dim">
                    {new Date(report.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={[
                    "font-mono text-xs uppercase tracking-wider",
                    ["error", "failed"].includes(report.stage)
                      ? "text-rust"
                      : ["done", "completed"].includes(report.stage)
                        ? "text-cyan-deep"
                        : "text-cyan",
                  ].join(" ")}
                >
                  {STAGE_LABEL[report.stage] ?? report.stage}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
