"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient, ApiError } from "@/lib/apiClient";
import PipelineStepper from "./PipelineStepper";

const STAGE = { criado: "received", analisando: "processing", processado: "done", falha: "error" };

export default function StatusTracker({ jobId }) {
  const [status, setStatus] = useState({ stage: "received", updatedAt: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return undefined;

    let stopped = false;
    let timer;
    async function refresh() {
      try {
        const uploads = await apiClient.get("/blobs");
        if (stopped) return;
        const upload = uploads.find((item) => item.requestId === jobId);
        if (!upload) throw new Error("Upload não encontrado");
        setStatus({ stage: STAGE[upload.status] ?? "received", updatedAt: upload.updatedAt });
        setError(upload.status === "falha" ? upload.errorMessage ?? "Falha no processamento" : null);
        if (upload.status !== "processado" && upload.status !== "falha") {
          timer = setTimeout(refresh, 5000);
        }
      } catch (err) {
        if (stopped) return;
        setError(err instanceof ApiError ? err.message : "Não foi possível consultar o andamento.");
        if (err.status !== 401) timer = setTimeout(refresh, 10000);
      }
    }
    refresh();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [jobId]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <PipelineStepper currentStage={status.stage} error={Boolean(error)} />

      <div className="mt-6 flex items-center justify-between font-mono text-xs text-foreground-dim">
        <span>{jobId}</span>
        <span>{status.updatedAt ? new Date(status.updatedAt).toLocaleTimeString("pt-BR") : "—"}</span>
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>
      )}
      {status.stage === "done" && (
        <Link href={`/dashboard/${jobId}`} className="mt-5 inline-block text-sm text-cyan-deep hover:underline">
          Ver insights
        </Link>
      )}
    </div>
  );
}
