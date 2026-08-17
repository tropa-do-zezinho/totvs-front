"use client";

import { use, useEffect, useState } from "react";
import { apiClient, ApiError } from "@/lib/apiClient";
import StatCard from "@/components/charts/StatCard";
import InsightsChart from "@/components/charts/InsightsChart";
import ShareModal from "@/components/ShareModal";

export default function ReportPage({ params }) {
  const { reportId } = use(params);

  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    apiClient
      .get(`/reports/${reportId}`)
      .then(setReport)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Não foi possível carregar o relatório."));
  }, [reportId]);

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="font-mono text-sm text-foreground-dim">Carregando…</p>
      </main>
    );
  }

  const insights = report.insights ?? { stats: [], charts: [] };

  return (
    <main className="flex flex-1 flex-col items-center p-4 py-16">
      <div className="w-full max-w-4xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">Relatório</p>
            <h1 className="mt-1 font-display text-2xl font-medium">{report.fileName}</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={report.pdfUrl}
              className="rounded-lg border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground hover:border-cyan"
            >
              Baixar PDF
            </a>
            <a
              href={report.xlsxUrl}
              className="rounded-lg border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-foreground hover:border-cyan"
            >
              Baixar XLSX
            </a>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="rounded-lg bg-cyan px-4 py-2 font-display text-sm font-medium text-ink"
            >
              Compartilhar
            </button>
          </div>
        </div>

        {insights.stats?.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {insights.stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
            ))}
          </div>
        )}

        {insights.charts?.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {insights.charts.map((chart) => (
              <InsightsChart
                key={chart.title}
                title={chart.title}
                data={chart.data}
                type={chart.type}
                accent={chart.accent}
              />
            ))}
          </div>
        )}
      </div>

      {isShareOpen && (
        <ShareModal
          reportId={reportId}
          sharedWith={report.sharedWith}
          onClose={() => setIsShareOpen(false)}
          onShared={(share) =>
            setReport((prev) => ({ ...prev, sharedWith: [...(prev.sharedWith ?? []), share] }))
          }
        />
      )}
    </main>
  );
}
