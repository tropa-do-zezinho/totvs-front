const STAGES = [
  { key: "received", label: "Recebido" },
  { key: "queued", label: "Na fila" },
  { key: "processing", label: "Processando" },
  { key: "done", label: "Pronto" },
];

/**
 * Elemento-assinatura do produto: visualiza o pipeline real do sistema
 * (upload -> fila -> worker -> pronto) como uma esteira horizontal.
 * Reaparece no upload, no acompanhamento de status e no dashboard.
 */
export default function PipelineStepper({ currentStage = "received", error = false, stages = STAGES }) {
  const currentIndex = stages.findIndex((stage) => stage.key === currentStage);

  return (
    <ol className="flex items-center w-full" aria-label="Progresso do processamento">
      {stages.map((stage, index) => {
        const isDone = index < currentIndex || (index === currentIndex && currentStage === "done");
        const isCurrent = index === currentIndex && currentStage !== "done";
        const isLast = index === stages.length - 1;

        return (
          <li key={stage.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span
                className={[
                  "flex h-3 w-3 rounded-full border-2 transition-colors",
                  error && isCurrent
                    ? "border-rust bg-rust"
                    : isDone
                      ? "border-cyan bg-cyan"
                      : isCurrent
                        ? "border-cyan bg-cyan animate-pulse"
                        : "border-line bg-transparent",
                ].join(" ")}
              />
              <span
                className={[
                  "font-mono text-[11px] uppercase tracking-wider whitespace-nowrap",
                  isDone || isCurrent ? "text-foreground" : "text-foreground-dim",
                ].join(" ")}
              >
                {stage.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={[
                  "h-px flex-1 mx-2 -mt-5",
                  isDone ? "bg-cyan" : "bg-line",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
