interface LogoProps {
  variant?: 'full' | 'compact' | 'emblem';
  className?: string;
}

/**
 * Citadelle Airlines emblem — a stylized silhouette of the Citadelle
 * Laferrière (crenellated fortress on a mountain peak) inside a gold
 * medallion, crossed by a gold aircraft in flight. Pure SVG so it stays
 * crisp from a 16px favicon up to a large hero mark.
 */
export function Emblem({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Citadelle Airlines">
      <defs>
        <clipPath id="citadelle-badge-clip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>
        <linearGradient id="citadelle-badge-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2620" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
      </defs>

      {/* Gold medallion ring */}
      <circle cx="50" cy="50" r="48" fill="#F2A81D" />
      <circle cx="50" cy="50" r="44" fill="#141414" />

      <g clipPath="url(#citadelle-badge-clip)">
        <rect x="4" y="4" width="92" height="92" fill="url(#citadelle-badge-sky)" />

        {/* Distant ridge line */}
        <path
          d="M4 66 L16 54 L26 61 L38 46 L50 58 L62 44 L74 56 L86 47 L96 58 L96 96 L4 96 Z"
          fill="#232019"
          opacity="0.8"
        />

        {/* Main peak */}
        <path d="M18 96 L50 32 L82 96 Z" fill="#332c1c" />

        {/* Citadelle fortress silhouette on the peak, crenellated wall */}
        <path
          d="M33 68 L33 58 L38 58 L38 53 L43 53 L43 58 L48 58 L48 50 L52 50 L52 58 L57 58 L57 53 L62 53 L62 58 L67 58 L67 68 Z"
          fill="#0d0d0d"
        />
        <rect x="30" y="68" width="40" height="7" fill="#0d0d0d" />

        {/* Warm highlight along the fortress wall, catching the light */}
        <rect x="30" y="68" width="40" height="1.4" fill="#F2A81D" opacity="0.55" />
      </g>

      {/* Gold aircraft banking across the medallion */}
      <g transform="translate(50 60) rotate(-16)">
        <path
          d="M-40 1.5 L-10 -1.5 L-2 -13 L3 -13 L1 -1.5 L18 -1.5 L27 -8 L32 -8 L26 1.5 L32 8 L27 8 L18 1.5 L1 1.5 L3 13 L-2 13 L-10 1.5 Z"
          fill="#F2A81D"
          stroke="#141414"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
}

export function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'emblem') {
    return <Emblem className={className} />;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Emblem className="h-8 w-8 shrink-0" />
        <span className="font-display text-lg font-extrabold tracking-tight whitespace-nowrap">
          <span className="text-citadelle-gold-dark">CITADELLE</span>{' '}
          <span className="text-citadelle-black">AIRLINES</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Emblem className="h-10 w-10 shrink-0" />
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-extrabold tracking-tight text-citadelle-gold-dark">
          CITADELLE
        </span>
        <span className="font-display text-[0.7rem] font-bold uppercase tracking-[0.25em] text-citadelle-black">
          Airlines
        </span>
      </div>
    </div>
  );
}
