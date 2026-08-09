interface LogoProps {
  variant?: 'full' | 'compact' | 'emblem';
  className?: string;
}

/**
 * Citadelle Airlines logo — a geometric emblem evoking the Citadelle Laferrière
 * silhouette combined with a wing/flight motif, in brand gold on black.
 */
export function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'emblem') {
    return (
      <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Citadelle Airlines">
        <rect width="48" height="48" rx="10" fill="#141414" />
        <path d="M10 30l14-5 11-11 3 3-11 11-5 14-3-3 1.5-7.5L10 30z" fill="#F2A81D" />
      </svg>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg viewBox="0 0 48 48" className="h-8 w-8" role="img" aria-label="Citadelle Airlines">
          <rect width="48" height="48" rx="10" fill="#141414" />
          <path d="M10 30l14-5 11-11 3 3-11 11-5 14-3-3 1.5-7.5L10 30z" fill="#F2A81D" />
        </svg>
        <span className="font-display text-lg font-extrabold tracking-tight text-citadelle-black">
          Citadelle
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-9 w-9 shrink-0" role="img" aria-label="Citadelle Airlines">
        <rect width="48" height="48" rx="10" fill="#141414" />
        <path d="M10 30l14-5 11-11 3 3-11 11-5 14-3-3 1.5-7.5L10 30z" fill="#F2A81D" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-display text-xl font-extrabold tracking-tight text-citadelle-black">
          Citadelle
        </span>
        <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-citadelle-gold-dark">
          Airlines
        </span>
      </div>
    </div>
  );
}
