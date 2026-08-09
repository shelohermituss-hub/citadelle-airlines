interface StatTileProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delay?: number;
  className?: string;
}

/** Icon-badge + bold value + uppercase label, used for any at-a-glance stat (fleet specs, flight/airport info, booking summaries). */
export function StatTile({ icon: Icon, label, value, delay = 0, className = '' }: StatTileProps) {
  return (
    <div
      className={`group flex flex-col items-center gap-1 rounded-xl bg-citadelle-cream py-2.5 px-2 text-center animate-slide-up transition-all duration-300 hover:bg-citadelle-gold/10 hover:-translate-y-0.5 hover:shadow-card ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <Icon className="h-4 w-4 text-citadelle-gold-dark transition-transform duration-300 group-hover:scale-110" />
      <p className="text-sm font-semibold text-citadelle-black leading-tight">{value}</p>
      <p className="text-[0.65rem] text-black/40 uppercase tracking-wide leading-none">{label}</p>
    </div>
  );
}
