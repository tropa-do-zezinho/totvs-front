"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/apiClient";
import StatCard from "@/components/charts/StatCard";

const LABEL = {
  criado: "Recebido",
  analisando: "Em análise",
  processado: "Processado",
  falha: "Falhou",
};

function formatValue(value) {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return new Intl.NumberFormat("pt-BR").format(value);
  return String(value);
}

function DataSection({ title, data }) {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data)) {
    return (
      <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h3 className="font-display text-lg font-medium">{title}</h3>
        <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words font-mono text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </section>
    );
  }
  return (
    <section className="mt-6 rounded-2xl border border-line bg-surface p-5">
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="border-t border-line pt-3">
            <dt className="font-mono text-xs text-foreground-dim">{key.replaceAll("_", " ")}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-sm">
              {value && typeof value === "object" ? JSON.stringify(value, null, 2) : formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function ReportPage({ params }) {
  const { reportId } = use(params);
  const [upload, setUpload] = useState(null);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stopped = false;
    let timer;
    async function refresh() {
      try {
        const uploads = await apiClient.get("/blobs");
        if (stopped) return;
        const current = uploads.find((item) => item.requestId === reportId);
        if (!current) throw new Error("Relatório não encontrado.");
        setUpload(current);
        if (current.status === "processado") {
          const result = await apiClient.get(`/insights/${encodeURIComponent(reportId)}`);
          if (!stopped) setInsight(result);
        } else if (current.status !== "falha") {
          timer = setTimeout(refresh, 5000);
        }
        if (!stopped) setError(null);
      } catch (err) {
        if (stopped) return;
        setError(err instanceof ApiError ? err.message : err.message);
        if (err.status !== 401) timer = setTimeout(refresh, 10000);
      }
    }
    refresh();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [reportId]);

  const summary = insight?.insights?.resumo;
  const meetings = insight?.insights?.reunioes ?? [];
  const primitives = Object.entries(summary ?? {}).filter(([, value]) => value == null || typeof value !== "object");
  const structured = Object.entries(summary ?? {}).filter(([, value]) => value && typeof value === "object");

  return (
    <main className="flex flex-1 flex-col items-center p-4 py-16">
      <div className="w-full max-w-4xl">
        <Link href="/dashboard" className="font-mono text-xs text-cyan-deep hover:underline">← Meus relatórios</Link>
        <p className="mt-7 font-mono text-xs uppercase tracking-wider text-cyan-deep">Relatório</p>
        <h1 className="mt-1 break-all font-display text-2xl font-medium">{upload?.fileName ?? reportId}</h1>
        {upload && (
          <p className="mt-2 font-mono text-xs text-foreground-dim">
            {LABEL[upload.status] ?? upload.status} · {upload.createdAt ? new Date(upload.createdAt).toLocaleString("pt-BR") : "—"} · {reportId}
          </p>
        )}
        {error && (
          <p className="mt-6 border-l-2 border-rust pl-3 text-sm text-rust">
            {error} <Link href="/login" className="underline">Entrar novamente</Link>
          </p>
        )}
        {!upload && !error && <p className="mt-8 text-sm text-foreground-dim">Carregando relatório…</p>}
        {upload?.status === "falha" && (
          <p className="mt-8 rounded-2xl border border-rust p-5 text-sm text-rust">
            {upload.errorMessage ?? "O processamento falhou."}
          </p>
        )}
        {upload && ["criado", "analisando"].includes(upload.status) && (
          <p className="mt-8 rounded-2xl border border-line bg-surface p-5 text-sm text-foreground-dim">
            O worker está processando o arquivo. Esta página atualiza automaticamente.
          </p>
        )}
        {upload?.status === "processado" && !insight && !error && (
          <p className="mt-8 text-sm text-foreground-dim">Carregando insights…</p>
        )}
        {insight && (
          <>
            {primitives.length > 0 && (
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {primitives.map(([key, value]) => (
                  <StatCard key={key} label={key.replaceAll("_", " ")} value={formatValue(value)} />
                ))}
              </div>
            )}
            {structured.map(([key, value]) => (
              <DataSection key={key} title={key.replaceAll("_", " ")} data={value} />
            ))}
            <h2 className="mt-10 font-display text-xl font-medium">
              Reuniões analisadas ({meetings.length})
            </h2>
            {meetings.length === 0 && <p className="mt-3 text-sm text-foreground-dim">Nenhuma reunião no resultado.</p>}
            <div className="mt-4 flex flex-col gap-4">
              {meetings.map((meeting, index) => (
                <details key={meeting.id_meeting ?? index} className="rounded-2xl border border-line bg-surface p-5">
                  <summary className="cursor-pointer font-display font-medium">
                    Reunião {meeting.id_meeting ?? index + 1}
                    {meeting.status_analise ? ` · ${meeting.status_analise.replaceAll("_", " ")}` : ""}
                  </summary>
                  <div className="mt-5">
                    {Object.entries(meeting).filter(([, value]) => value && typeof value === "object").map(([key, value]) => (
                      <DataSection key={key} title={key.replaceAll("_", " ")} data={value} />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

