type Point = { x: number; y: number };

const P0 = { x: 48, y: 176 };
const P1 = { x: 150, y: 206 };
const P2 = { x: 230, y: 70 };
const P3 = { x: 350, y: 82 };
const ROUTE = `M${P0.x} ${P0.y}C${P1.x} ${P1.y} ${P2.x} ${P2.y} ${P3.x} ${P3.y}`;

function at(t: number): Point {
  const u = 1 - t;
  const a = u * u * u,
    b = 3 * u * u * t,
    c = 3 * u * t * t,
    d = t * t * t;
  return {
    x: a * P0.x + b * P1.x + c * P2.x + d * P3.x,
    y: a * P0.y + b * P1.y + c * P2.y + d * P3.y,
  };
}

const clamp = (x: number) => Math.min(330, Math.max(70, x));

/** Field-journal sketch of a ride: neighbourhood on the left, ENSA on the right, pickups in travel order. */
export function RouteSketch({
  from,
  stops,
  evening,
}: {
  from: string;
  stops: string[];
  evening: boolean;
}) {
  const n = stops.length;
  const placed = stops.map((name, i) => {
    const step = (i + 1) / (n + 1);
    return { name, n: i + 1, ...at(evening ? 1 - step : step) };
  });
  const mid = at(0.5);
  const ahead = at(evening ? 0.47 : 0.53);
  const angle = (Math.atan2(ahead.y - mid.y, ahead.x - mid.x) * 180) / Math.PI;

  return (
    <figure className="route-sketch rounded-lg border-2 border-ink bg-card p-3">
      <svg
        viewBox="0 0 400 236"
        role="img"
        aria-label={`Croquis du trajet ${evening ? `ENSA vers ${from}` : `${from} vers ENSA`}, ${n} pickup${n > 1 ? "s" : ""} : ${stops.join(", ")}`}
        className="block h-auto w-full text-foreground"
      >
        <g stroke="currentColor" strokeWidth=".6" opacity=".14">
          <path d="M20 40H380M20 100H380M20 160H380M20 214H380" />
          <path d="M90 20V220M200 20V220M310 20V220" strokeDasharray="2 6" />
        </g>
        <g
          stroke="currentColor"
          strokeWidth="1.3"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M14 168V136H38V124H58V168M10 135H42M34 123H62M22 146H30V156H22ZM44 136H52V146H44Z" />
          <path d="M318 74V48H346V30H376V74M314 47H350M342 29H380M326 54H334V62H326ZM356 40H366V50H356ZM356 56H366V66H356Z" />
          <path d="M304 160Q301 140 305 118M305 118Q290 106 280 116M305 118Q300 100 312 96M305 118Q320 104 330 112M305 118Q318 122 322 134" />
          <path d="M10 172Q40 170 70 173M310 78Q345 76 384 79" strokeWidth=".7" />
        </g>
        <path
          d={ROUTE}
          stroke="currentColor"
          strokeWidth=".7"
          opacity=".35"
          transform="translate(2 3)"
          fill="none"
          strokeDasharray="3 5"
        />
        <path d={ROUTE} stroke="var(--route)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        <path
          d="M-6 -5L2 0L-6 5"
          stroke="var(--route)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          transform={`translate(${mid.x} ${mid.y}) rotate(${angle})`}
        />
        <circle cx={P0.x} cy={P0.y} r="4" fill="var(--route)" />
        <circle cx={P3.x} cy={P3.y} r="4" fill="var(--route)" />
        <text
          x={P0.x - 4}
          y={P0.y + 26}
          fill="currentColor"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="700"
          letterSpacing="1.5"
        >
          {from.toUpperCase()}
        </text>
        <text
          x={P3.x + 6}
          y={P3.y + 22}
          fill="currentColor"
          fontFamily="var(--font-mono)"
          fontSize="11"
          fontWeight="700"
          letterSpacing="1.5"
          textAnchor="middle"
        >
          ENSA
        </text>
        {placed.map((p, i) => {
          const above = i % 2 === 0;
          const ly = above ? p.y - 18 : p.y + 26;
          return (
            <g key={p.name}>
              <path
                d={`M${p.x} ${p.y + (above ? -9 : 9)}L${p.x} ${ly + (above ? 4 : -12)}`}
                stroke="currentColor"
                strokeWidth=".7"
                opacity=".6"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="9"
                className="fill-card"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <text
                x={p.x}
                y={p.y + 3.5}
                textAnchor="middle"
                fill="currentColor"
                fontFamily="var(--font-mono)"
                fontSize="10"
                fontWeight="700"
              >
                {p.n}
              </text>
              <text
                x={clamp(p.x)}
                y={ly}
                textAnchor="middle"
                fill="currentColor"
                fontFamily="Georgia, 'Times New Roman', serif"
                fontStyle="italic"
                fontSize="12"
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 border-t border-ink/20 pt-2 font-mono text-[10px] uppercase text-muted-foreground">
        Croquis indicatif · ordre des pickups {evening ? "depuis l’ENSA" : "vers l’ENSA"} · pas un
        GPS
      </figcaption>
    </figure>
  );
}
