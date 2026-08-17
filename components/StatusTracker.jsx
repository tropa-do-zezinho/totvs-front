"use client";

import { useEffect, useState } from "react";
import { subscribeToJobStatus } from "@/lib/websocket";
import PipelineStepper from "./PipelineStepper";

export default function StatusTracker({ jobId, onComplete }) {
  const [status, setStatus] = useState({ stage: "received", updatedAt: null });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return undefined;

    const unsubscribe = subscribeToJobStatus(jobId, {
      onStatus: (payload) => {
        setStatus(payload);
        setError(payload.stage === "error" ? payload.message ?? "Falha no processamento" : null);
        if (payload.stage === "done") onComplete?.(payload);
      },
      onError: (err) => setError(err.message),
    });

    return unsubscribe;
  }, [jobId, onComplete]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <PipelineStepper currentStage={status.stage} error={Boolean(error)} />

      <div className="mt-6 flex items-center justify-between font-mono text-xs text-foreground-dim">
        <span>job {jobId}</span>
        <span>{status.updatedAt ? new Date(status.updatedAt).toLocaleTimeString("pt-BR") : "—"}</span>
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-rust pl-3 text-sm text-rust">{error}</p>
      )}
    </div>
  );
}
