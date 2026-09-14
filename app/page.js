import Link from "next/link";
import PipelineStepper from "@/components/PipelineStepper";
import BrandMotif from "@/components/BrandMotif";

const STAGES = [
  { key: "received", label: "Envie" },
  { key: "processing", label: "Acompanhe" },
  { key: "done", label: "Explore" },
];

export default function LandingPage() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-14 sm:py-24">
      <BrandMotif className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 opacity-[0.06] sm:h-[26rem] sm:w-[26rem] dark:opacity-[0.1]" />

      <div className="relative w-full max-w-4xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-deep">
          Inteligência para reuniões · TOTVS
        </p>
        <h1 className="mt-5 font-display text-[clamp(3.1rem,14vw,8rem)] font-semibold leading-none tracking-[-0.07em] text-foreground">
          Mood<span className="text-cyan-deep">Lens</span>
        </h1>
        <h2 className="mt-6 font-display text-xl font-medium leading-tight sm:text-3xl">
          Transforme conversas em próximos passos.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-foreground-dim sm:text-base">
          Envie suas reuniões, acompanhe a análise e descubra prioridades,
          evidências e ações para tomar melhores decisões.
        </p>

        <div className="mt-10 rounded-2xl border border-line bg-surface px-5 py-8 sm:px-8">
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
