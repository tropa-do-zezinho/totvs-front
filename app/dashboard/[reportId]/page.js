"use client";

import { use, useEffect, useMemo, useState } from "react";
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
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
  }
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
  return <dl className="grid min-w-0 gap-4 sm:grid-cols-2">{Object.entries(data).map(([key, value]) => <div key={key} className="min-w-0 border-t border-line pt-3"><dt className="text-xs font-medium text-foreground-dim">{labelFor(key)}</dt><dd className="mt-1 min-w-0 break-words text-sm leading-relaxed [overflow-wrap:anywhere]"><ValueView value={value} /></dd></div>)}</dl>;
}

function DataSection({ title, data }) {
  if (data == null) return null;
  return <section className="mt-5 rounded-2xl border border-line bg-surface p-5 sm:p-6"><h3 className="font-display text-lg font-medium">{title}</h3><div className="mt-4"><ValueView value={data} /></div></section>;
}

const BAR_COLORS = ["#00a4c2", "#d6a53b", "#d1264a", "#7867bb", "#4f9d78"];
const EMPTY_MEETINGS = [];

function BarChart({ title, data, note }) {
  const entries = Object.entries(data ?? {}).filter(([, count]) => Number(count) > 0).sort((a, b) => Number(b[1]) - Number(a[1]));
  const max = Math.max(1, ...entries.map(([, count]) => Number(count)));
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <p className="mt-1 text-xs text-foreground-dim">{note}</p>
      {entries.length === 0 ? <p className="mt-6 text-sm text-foreground-dim">Nenhum sinal identificado neste arquivo.</p> : (
        <ol className="mt-6 space-y-4">
          {entries.map(([label, count], index) => (
            <li key={label}>
              <div className="flex min-w-0 items-baseline justify-between gap-3 text-sm"><span className="min-w-0 break-words">{formatValue(label)}</span><strong className="shrink-0 font-mono text-xs">{formatValue(count)}</strong></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-raised" role="img" aria-label={`${formatValue(label)}: ${count}`}>
                <div className="h-full rounded-full" style={{ width: `${Math.max(3, Number(count) / max * 100)}%`, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function ReportPage({ params }) {
  const { reportId } = use(params);
  const [upload, setUpload] = useState(null);
  const [insight, setInsight] = useState(null);
  const [error, setError] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("todos");
  const [page, setPage] = useState(1);

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
  const meetings = insight?.insights?.reunioes ?? EMPTY_MEETINGS;
  const priorities = summary?.distribuicao_prioridade ?? {};
  const products = Object.fromEntries((summary?.produtos?.confirmados_llm?.length
    ? summary.produtos.confirmados_llm
    : summary?.produtos?.sinais_heuristicos ?? []).slice(0, 5).map((item) => [item.nome, item.quantidade]));
  const priorityOptions = Object.keys(priorities).filter(Boolean);
  const filteredMeetings = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return meetings.filter((meeting) => {
      if (priorityFilter !== "todos" && meeting.prioridade?.classificacao !== priorityFilter) return false;
      if (!term) return true;
      return [meeting.id_meeting, meeting.metadata?.segmento, meeting.prioridade?.classificacao,
        meeting.triagem?.recomendacao, meeting.status_analise]
        .some((value) => String(value ?? "").toLocaleLowerCase("pt-BR").includes(term));
    }).sort((a, b) => Number(b.prioridade?.score_prioridade_final ?? 0) - Number(a.prioridade?.score_prioridade_final ?? 0));
  }, [meetings, search, priorityFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredMeetings.length / 12));
  const visibleMeetings = filteredMeetings.slice((Math.min(page, pageCount) - 1) * 12, Math.min(page, pageCount) * 12);

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
            <section className="mt-8 min-w-0 rounded-2xl border border-cyan bg-surface p-5 sm:p-7">
              <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">Panorama do arquivo</p>
              <h2 className="mt-2 font-display text-xl font-medium sm:text-2xl">O que as reuniões revelam</h2>
              <p className="mt-2 text-sm text-foreground-dim">Os números abaixo vêm das reuniões deste arquivo. Abra uma reunião para conferir os sinais e as evidências.</p>
              <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
                <StatCard label="Reuniões analisadas" value={formatValue(meetings.length)} />
                <StatCard label="Candidatas à análise por IA" value={formatValue(summary?.totais?.candidatas_llm ?? 0)} />
                <StatCard label="Análises por IA concluídas" value={formatValue(summary?.totais?.concluidas_llm_rag ?? 0)} />
              </div>
              {summary?.gerado_em_utc && <p className="mt-4 text-xs text-foreground-dim">Resultado gerado em {formatValue(summary.gerado_em_utc)}.</p>}
            </section>

            <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-2">
              <BarChart title="Prioridade das reuniões" data={priorities} note="Quantidade de reuniões por classificação" />
              <BarChart title="Produtos mencionados" data={products} note={summary?.produtos?.confirmados_llm?.length ? "Menções confirmadas pela análise por IA" : "Sinais encontrados na triagem local"} />
            </div>

            <section className="mt-10 min-w-0" aria-labelledby="meetings-heading">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div><h2 id="meetings-heading" className="font-display text-xl font-medium">Explore as reuniões</h2><p className="mt-1 text-sm text-foreground-dim">{filteredMeetings.length} de {meetings.length} reuniões · ordenadas por prioridade</p></div>
                <div className="grid w-full gap-2 sm:flex sm:w-auto">
                  <label className="min-w-0 w-full sm:w-64"><span className="sr-only">Buscar reuniões</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar ID, segmento ou ação" className="w-full min-w-0 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-cyan" /></label>
                  <label className="min-w-0 w-full sm:w-auto"><span className="sr-only">Filtrar por prioridade</span><select value={priorityFilter} onChange={(event) => { setPriorityFilter(event.target.value); setPage(1); }} className="w-full max-w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-cyan"><option value="todos">Todas as prioridades</option>{priorityOptions.map((value) => <option key={value} value={value}>{formatValue(value)}</option>)}</select></label>
                </div>
              </div>
              {filteredMeetings.length === 0 && <p className="mt-5 rounded-2xl border border-line bg-surface p-5 text-sm text-foreground-dim">Nenhuma reunião corresponde à busca. Tente outro termo ou selecione todas as prioridades.</p>}
              <div className="mt-5 grid min-w-0 gap-3">
                {visibleMeetings.map((meeting, index) => (
                  <details key={meeting.id_meeting ?? index} className="group min-w-0 rounded-2xl border border-line bg-surface p-4 open:border-cyan sm:p-5">
                    <summary className="min-w-0 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0"><span className="font-display font-medium">Reunião {meeting.id_meeting ?? index + 1}</span><p className="mt-1 break-words text-xs text-foreground-dim">{meeting.metadata?.segmento || "Segmento não informado"} · {formatValue(meeting.prioridade?.classificacao ?? "Prioridade não informada")}</p></div>
                        <div className="flex shrink-0 items-center gap-3"><span className="font-mono text-xs text-cyan-deep">{formatValue(meeting.prioridade?.score_prioridade_final ?? "—")} pontos</span><span aria-hidden="true" className="text-cyan-deep group-open:rotate-90">›</span></div>
                      </div>
                    </summary>
                    <div className="mt-5 min-w-0 space-y-4 border-t border-line pt-5">
                      <div className="min-w-0 rounded-xl bg-surface-raised p-4"><p className="text-xs font-medium uppercase tracking-wider text-foreground-dim">Próxima ação</p><p className="mt-2 break-words text-sm leading-relaxed">{meeting.status_analise === "concluida_llm_rag" ? formatValue(meeting.analise_ia?.proxima_acao) : formatValue(meeting.triagem?.recomendacao)}</p><p className="mt-2 text-xs text-foreground-dim">{meeting.status_analise === "concluida_llm_rag" ? "Sugerida pela análise por IA. Confira as evidências antes de decidir." : "Sugerida pela triagem local; a análise por IA não foi concluída."}</p></div>
                      <DataSection title="Dados e sinais desta reunião" data={Object.fromEntries(Object.entries(meeting).filter(([key]) => !["id_meeting", "schema_version"].includes(key)))} />
                    </div>
                  </details>
                ))}
              </div>
              {pageCount > 1 && <nav aria-label="Páginas de reuniões" className="mt-5 flex items-center justify-between gap-3"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-line px-3 py-2 text-sm disabled:opacity-40">Anterior</button><span className="text-center text-xs text-foreground-dim">Página {page} de {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-line px-3 py-2 text-sm disabled:opacity-40">Próxima</button></nav>}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
