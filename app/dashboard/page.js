"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/apiClient";

const STATUS = {
  criado: ["Recebido", "Aguardando análise"],
  analisando: ["Em análise", "Processamento em andamento"],
  processado: ["Pronto", "Insights disponíveis"],
  falha: ["Falhou", "Precisa de atenção"],
};

function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data indisponível" : date.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

export default function DashboardPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState(null);
  const [requiresLogin, setRequiresLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");

  useEffect(() => {
    let stopped = false;
    async function refresh() {
      try {
        const uploads = await apiClient.get("/blobs");
        if (!stopped) { setReports(Array.isArray(uploads) ? uploads : []); setError(null); setRequiresLogin(false); }
      } catch (err) {
        if (!stopped) { setError(err instanceof ApiError ? err.message : "Não foi possível carregar os relatórios."); setRequiresLogin(err instanceof ApiError && err.status === 401); }
      }
    }
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => { stopped = true; clearInterval(timer); };
  }, []);

  const counts = useMemo(() => {
    const value = { todos: reports?.length ?? 0, processado: 0, andamento: 0, falha: 0 };
    for (const report of reports ?? []) {
      if (report.status === "processado") value.processado++;
      else if (report.status === "falha") value.falha++;
      else value.andamento++;
    }
    return value;
  }, [reports]);

  const visible = useMemo(() => (reports ?? []).filter((report) => {
    const matchesFilter = filter === "todos" || (filter === "andamento" ? ["criado", "analisando"].includes(report.status) : report.status === filter);
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const matchesSearch = !term || [report.fileName, report.requestId, STATUS[report.status]?.[0]].some((value) => String(value ?? "").toLocaleLowerCase("pt-BR").includes(term));
    return matchesFilter && matchesSearch;
  }).sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)), [reports, search, filter]);

  return <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14"><div className="mx-auto max-w-5xl">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-cyan-deep">MoodLens / espaço de trabalho</p><h1 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">Suas análises, em um só lugar.</h1><p className="mt-2 max-w-xl text-sm text-foreground-dim">Acompanhe cada arquivo enviado e abra os resultados quando a análise terminar.</p></div><Link href="/upload" className="rounded-xl bg-cyan px-5 py-3 font-display text-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-cyan">Enviar arquivo ↗</Link></div>
    {reports && reports.length > 0 && <section aria-label="Panorama dos arquivos" className="mt-10 grid gap-3 sm:grid-cols-3">{[["processado", "Prontos para consultar", "Resultados publicados"], ["andamento", "Em andamento", "Recebidos ou em análise"], ["falha", "Precisam de atenção", "Arquivos com falha"]].map(([key, title, caption]) => <button key={key} type="button" onClick={() => setFilter(filter === key ? "todos" : key)} aria-pressed={filter === key} className={`rounded-2xl border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-cyan ${filter === key ? "border-cyan bg-surface-raised" : "border-line bg-surface hover:border-cyan"}`}><span className={`block font-display text-3xl font-medium ${key === "falha" && counts[key] ? "text-rust" : "text-cyan-deep"}`}>{counts[key]}</span><span className="mt-2 block font-display text-sm font-medium">{title}</span><span className="mt-1 block text-xs text-foreground-dim">{caption}</span><span aria-hidden="true" className="mt-5 flex h-1.5 overflow-hidden rounded-full bg-surface-raised"><span className={key === "falha" ? "bg-rust" : "bg-cyan"} style={{ width: `${counts.todos ? counts[key] / counts.todos * 100 : 0}%` }} /></span></button>)}</section>}
    <section aria-labelledby="files-heading" className="mt-10"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="files-heading" className="font-display text-xl font-medium">Arquivos enviados</h2><p className="mt-1 text-sm text-foreground-dim">{reports ? `${visible.length} de ${reports.length} arquivos` : "Carregando arquivos…"}</p></div>{reports?.length > 0 && <label className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-cyan sm:w-auto sm:min-w-72"><span aria-hidden="true" className="text-foreground-dim">⌕</span><span className="sr-only">Pesquisar arquivos</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar arquivo ou código" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-foreground-dim" /></label>}</div>
      {reports?.length > 0 && <div aria-label="Filtrar arquivos" className="mt-5 flex flex-wrap gap-2">{[["todos", "Todos"], ["processado", "Prontos"], ["andamento", "Em andamento"], ["falha", "Falhas"]].map(([key, label]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)} className={`rounded-full border px-3 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-cyan ${filter === key ? "border-cyan bg-cyan text-ink" : "border-line bg-surface text-foreground-dim hover:border-cyan"}`}>{label}</button>)}</div>}
      {error && <p role="alert" className="mt-6 border-l-2 border-rust pl-3 text-sm text-rust">{error} {requiresLogin && <Link href="/login" className="underline">Entrar novamente</Link>}</p>}
      {!reports && !error && <p className="mt-8 text-sm text-foreground-dim">Carregando suas análises…</p>}
      {reports?.length === 0 && <div className="mt-6 rounded-2xl border border-line bg-surface p-8"><p className="font-display text-lg">Seu primeiro resultado começa com um arquivo.</p><p className="mt-2 text-sm text-foreground-dim">Envie uma reunião para acompanhar o processamento e consultar os insights aqui.</p><Link href="/upload" className="mt-5 inline-block text-sm text-cyan-deep underline">Enviar arquivo</Link></div>}
      {reports?.length > 0 && visible.length === 0 && <p className="mt-6 rounded-2xl border border-line bg-surface p-6 text-sm text-foreground-dim">Nenhum arquivo corresponde à busca. Tente outro nome ou selecione “Todos”.</p>}
      <ul className="mt-5 grid gap-3">{visible.map((report) => { const status = STATUS[report.status] ?? [report.status ?? "Desconhecido", "Ver detalhes"]; return <li key={report.requestId}><Link href={`/dashboard/${encodeURIComponent(report.requestId)}`} className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-cyan focus-visible:outline-2 focus-visible:outline-cyan"><div className="min-w-0"><p className="truncate font-display font-medium group-hover:text-cyan-deep">{report.fileName || "Arquivo sem nome"}</p><p className="mt-1 text-xs text-foreground-dim">Enviado em {dateLabel(report.createdAt)}</p></div><div className="flex items-center gap-5"><div className="text-right"><p className={`font-mono text-xs font-medium uppercase tracking-wider ${report.status === "falha" ? "text-rust" : "text-cyan-deep"}`}>{status[0]}</p><p className="mt-1 text-xs text-foreground-dim">{status[1]}</p></div><span aria-hidden="true" className="text-cyan-deep">↗</span></div></Link></li>; })}</ul>
    </section>
  </div></main>;
}
