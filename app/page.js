import Link from "next/link";
import PipelineStepper from "@/components/PipelineStepper";
import BrandMotif from "@/components/BrandMotif";

const STAGES = [
  { key: "received", label: "Upload" },
  { key: "queued", label: "Fila" },
  { key: "processing", label: "IA processa" },
  { key: "done", label: "Insights" },
];

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-24">
      <BrandMotif className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-[0.06] sm:h-[26rem] sm:w-[26rem] dark:opacity-[0.1]" />

      <div className="relative w-full max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-wider text-cyan-deep">
          Upload → Fila → IA → Dashboard
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium leading-tight sm:text-5xl">
          Arquivo bruto entra.
          <br />
          Insight sai pronto.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-foreground-dim">
          Envie uma planilha, acompanhe o processamento em tempo real e receba um dashboard,
          PDF e XLSX gerados por IA — prontos para compartilhar com o time.
        </p>

        <div className="mt-10 rounded-2xl border border-line bg-surface px-4 py-8 sm:px-6">
          <PipelineStepper currentStage="done" stages={STAGES} />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="w-full rounded-lg bg-cyan px-6 py-3 text-center font-display text-sm font-medium text-ink sm:w-auto"
          >
            Criar conta
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-line px-6 py-3 text-center font-mono text-xs uppercase tracking-wider text-foreground hover:border-cyan sm:w-auto"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    </main>
  );
}
