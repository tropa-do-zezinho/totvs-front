/**
 * Par de retângulos arredondados e girados, ecoando a composição de
 * "bandeiras" sobrepostas do símbolo da TOTVS — sem reproduzir a marca
 * registrada, só a linguagem de forma (retângulo arredondado + rotação).
 */
export default function BrandMotif({ className = "" }) {
  return (
    <svg viewBox="0 0 400 320" className={className} aria-hidden="true">
      <rect
        x="20" y="40" width="230" height="140" rx="28"
        transform="rotate(-14 135 110)"
        className="fill-line"
      />
      <rect
        x="150" y="150" width="230" height="140" rx="28"
        transform="rotate(-14 265 220)"
        className="fill-cyan"
      />
    </svg>
  );
}
