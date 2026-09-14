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

const FIELD_LABELS = {
  id_meeting: "Reunião", dt_meeting: "Data da reunião", nome_segmento: "Segmento",
  nota_nps: "Nota NPS", status_analise: "Estado da análise", sentimento: "Sentimento",
  resumo: "Resumo", reunioes: "Reuniões", total_reunioes: "Reuniões analisadas",
  principais_dores: "Principais dores", dores: "Dores relatadas", oportunidades: "Oportunidades",
  riscos: "Riscos", acoes: "Ações sugeridas", proximos_passos: "Próximos passos",
  topicos: "Tópicos", insights: "Insights", palavras_chave: "Palavras-chave",
  metadata: "Dados da reunião", prioridade: "Prioridade", triagem: "Triagem inicial",
  analise_ia: "Análise por IA", rag: "Contexto consultado", modelo: "Modelo utilizado",
  versao_prompt: "Versão da análise", recomendacao: "Recomendação da triagem",
  proxima_acao: "Próxima ação", evidencias: "Evidências", trecho: "Trecho da reunião",
};

function labelFor(key) {
  return FIELD_LABELS[key] ?? key.replaceAll("_", " ").replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function formatValue(value) {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return new Intl.NumberFormat("pt-BR").format(value);
  return String(value).replaceAll("_", " ");
}

function ValueView({ value }) {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-foreground-dim">Nenhum item registrado.</span>;
    return <ul className="grid gap-2">{value.map((item, index) => <li key={index} className="rounded-xl bg-surface-raised px-4 py-3">{item && typeof item === "object" ? <Fields data={item} /> : formatValue(item)}</li>)}</ul>;
  }
  if (value && typeof value === "object") return <Fields data={value} />;
  return <span className="whitespace-pre-wrap break-words">{formatValue(value)}</span>;
}

function Fields({ data }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{Object.entries(data).map(([key, value]) => <div key={key} className="min-w-0 border-t border-line pt-3"><dt className="text-xs font-medium text-foreground-dim">{labelFor(key)}</dt><dd className="mt-1 text-sm leading-relaxed"><ValueView value={value} /></dd></div>)}</dl>;
}

function DataSection({ title, data }) {
  if (data == null) return null;
  return <section className="mt-5 rounded-2xl border border-line bg-surface p-5 sm:p-6"><h3 className="font-display text-lg font-medium">{title}</h3><div className="mt-4"><ValueView value={data} /></div></section>;
}

export default function ReportPage({ params }) {
  const { reportId } = use(params);
  const [upload, setUpload] = useState(null);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);

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
        if (!stopped) { setError(null); setRequiresLogin(false); }
      } catch (err) {
        if (stopped) return;
        setError(err instanceof ApiError ? err.message : err.message);
        setRequiresLogin(err instanceof ApiError && err.status === 401);
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
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-14">
      <div className="w-full max-w-5xl">
        <Link href="/dashboard" className="font-mono text-xs text-cyan-deep hover:underline">← Meus relatórios</Link>
        <p className="mt-7 font-mono text-xs uppercase tracking-wider text-cyan-deep">MoodLens / relatório</p>
        <h1 className="mt-1 break-words font-display text-3xl font-medium">{upload?.fileName ?? reportId}</h1>
        {upload && (
          <p className="mt-2 break-all font-mono text-xs text-foreground-dim">
            {LABEL[upload.status] ?? upload.status} · {upload.createdAt ? new Date(upload.createdAt).toLocaleString("pt-BR") : "—"} · {reportId}
          </p>
        )}
        {error && (
          <p className="mt-6 border-l-2 border-rust pl-3 text-sm text-rust">
            {error} {requiresLogin && <Link href="/login" className="underline">Entrar novamente</Link>}
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
            A análise está em andamento. Esta página atualiza automaticamente; você pode voltar mais tarde.
          </p>
        )}
        {upload?.status === "processado" && !insight && !error && (
          <p className="mt-8 text-sm text-foreground-dim">Carregando insights…</p>
        )}
        {insight && (
          <>
            <section className="mt-8 rounded-2xl border border-cyan bg-surface p-6"><p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">Análise concluída</p><h2 className="mt-2 font-display text-xl font-medium">O que encontramos neste arquivo</h2><p className="mt-2 text-sm text-foreground-dim">Explore o panorama e abra cada reunião para entender os detalhes.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><StatCard label="Reuniões analisadas" value={meetings.length} />{primitives.slice(0, 2).map(([key, value]) => <StatCard key={key} label={labelFor(key)} value={formatValue(value)} />)}</div></section>
            {primitives.length > 2 && <div className="mt-4 grid gap-3 sm:grid-cols-3">{primitives.slice(2).map(([key, value]) => <StatCard key={key} label={labelFor(key)} value={formatValue(value)} />)}</div>}
            {structured.map(([key, value]) => (
              <DataSection key={key} title={labelFor(key)} data={value} />
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
                  <div className="mt-5 space-y-5">
                    <div className="rounded-xl bg-surface-raised p-4"><p className="text-xs font-medium uppercase tracking-wider text-foreground-dim">Próxima ação</p><p className="mt-2 text-sm leading-relaxed">{meeting.status_analise === "concluida_llm_rag" ? formatValue(meeting.analise_ia?.proxima_acao) : formatValue(meeting.triagem?.recomendacao)}</p><p className="mt-2 text-xs text-foreground-dim">{meeting.status_analise === "concluida_llm_rag" ? "Sugerida pela análise por IA. Confira as evidências antes de decidir." : "Sugerida pela triagem local; a análise por IA ainda não foi concluída."}</p></div>
                    <Fields data={Object.fromEntries(Object.entries(meeting).filter(([key]) => !["id_meeting", "status_analise"].includes(key)))} />
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
