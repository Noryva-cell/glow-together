import { cn } from '@/lib/utils';

/**
 * Mimo animé : un personnage jelly/clay dessiné en SVG qui bouge en continu
 * (respiration, clignements, regard qui balaie, bras qui salue, bouche qui vit).
 */

const HAPPY = ['felicitation', 'encouragement', 'joie', 'cuisine', 'bravo'];

export default function MimoCharacter({ mood = 'accueil', className }) {
  const happy = HAPPY.includes(mood);
  const thinking = mood === 'reflexion' || mood === 'concentration';
  const mouth = thinking ? { rx: 9, ry: 4.5 } : happy ? { rx: 15, ry: 9.5 } : { rx: 12, ry: 7 };

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Mimo"
      className={cn('overflow-visible', className)}
    >
      <defs>
        <radialGradient id="mimo-halo" cx="50%" cy="45%" r="52%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="mimo-body" x1="22%" y1="4%" x2="82%" y2="96%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--chart-1))' }} />
          <stop offset="52%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--chart-5))' }} />
        </linearGradient>
        <linearGradient id="mimo-arm" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--chart-1))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--primary))' }} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="98" rx="94" ry="94" fill="url(#mimo-halo)" />
      <ellipse cx="100" cy="183" rx="46" ry="9" className="fill-foreground" opacity="0.09" />

      <g className="mimo-anim-sway">
        {/* pieds */}
        <ellipse cx="78" cy="172" rx="16" ry="9" className="fill-chart-5" opacity="0.95" />
        <ellipse cx="122" cy="172" rx="16" ry="9" className="fill-chart-5" opacity="0.95" />

        {/* bras */}
        <g className="mimo-anim-wave">
          <ellipse cx="151" cy="128" rx="12" ry="21" fill="url(#mimo-arm)" transform="rotate(16 151 128)" />
        </g>
        <ellipse cx="49" cy="130" rx="12" ry="21" fill="url(#mimo-arm)" transform="rotate(-16 49 130)" />

        {/* corps */}
        <path
          d="M100 26 C141 26 173 58 173 104 C173 149 140 177 100 177 C60 177 27 149 27 104 C27 58 59 26 100 26 Z"
          fill="url(#mimo-body)"
        />
        {/* reflet */}
        <ellipse cx="73" cy="62" rx="27" ry="17" transform="rotate(-24 73 62)" className="fill-white" opacity="0.32" />

        {/* petite pousse sur la tête */}
        <g className="mimo-anim-tuft">
          <path
            d="M100 28 C98 18 104 12 112 9"
            fill="none"
            className="stroke-chart-5"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>

        {/* joues */}
        <ellipse cx="62" cy="121" rx="11" ry="6" className="fill-chart-3" opacity="0.55" />
        <ellipse cx="138" cy="121" rx="11" ry="6" className="fill-chart-3" opacity="0.55" />

        {/* yeux */}
        <g className="mimo-anim-blink">
          <ellipse cx="80" cy="98" rx="15" ry="17" className="fill-white" />
          <ellipse cx="120" cy="98" rx="15" ry="17" className="fill-white" />
          <g className="mimo-anim-look">
            <ellipse cx="80" cy="100" rx="7.5" ry="8.6" className="fill-foreground" />
            <ellipse cx="120" cy="100" rx="7.5" ry="8.6" className="fill-foreground" />
            <circle cx="82.6" cy="96.6" r="2.6" className="fill-white" opacity="0.92" />
            <circle cx="122.6" cy="96.6" r="2.6" className="fill-white" opacity="0.92" />
          </g>
        </g>

        {/* bouche qui parle */}
        <g className="mimo-anim-mouth">
          <ellipse cx="100" cy="127" rx={mouth.rx} ry={mouth.ry} className="fill-foreground" opacity="0.88" />
          <ellipse
            cx="100"
            cy={127 + mouth.ry * 0.5}
            rx={mouth.rx * 0.5}
            ry={mouth.ry * 0.42}
            className="fill-chart-1"
          />
        </g>
      </g>
    </svg>
  );
}