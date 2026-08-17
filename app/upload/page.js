"use client";

import { useState } from "react";
import Link from "next/link";
import UploadForm from "@/components/UploadForm";
import StatusTracker from "@/components/StatusTracker";

export default function UploadPage() {
  const [activeJobId, setActiveJobId] = useState(null);

  return (
    <main className="flex flex-1 flex-col items-center p-4 py-16">
      <div className="w-full max-w-xl">
        <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">Novo relatório</p>
        <h1 className="mt-1 font-display text-2xl font-medium">Enviar arquivo para a fábrica</h1>
        <p className="mt-2 text-sm text-foreground-dim">
          O arquivo entra na fila, o worker processa com IA e você é avisado aqui mesmo quando o
          dashboard estiver pronto.
        </p>

        <div className="mt-8">
          {activeJobId ? (
            <StatusTracker jobId={activeJobId} />
          ) : (
            <UploadForm onJobCreated={setActiveJobId} />
          )}
        </div>

        {activeJobId && (
          <p className="mt-4 font-mono text-xs text-foreground-dim">
            Pode navegar tranquilo —{" "}
            <Link href="/dashboard" className="text-cyan-deep hover:underline">
              acompanhe todos os relatórios no dashboard
            </Link>
            .
          </p>
        )}
      </div>
    </main>
  );
}
