interface ListRowProps {
  badge: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  active?: boolean;
  className?: string;
}

/** Leading badge + bold title + gray subtitle + optional trailing action, used for airport/passenger/booking rows. */
export function ListRow({ badge, title, subtitle, trailing, onClick, onMouseEnter, active = false, className = '' }: ListRowProps) {
  const content = (
    <>
      <span className="shrink-0">{badge}</span>
      <span className="flex-1 min-w-0 flex flex-col text-left">
        <span className="text-sm font-semibold text-citadelle-black truncate">{title}</span>
        {subtitle && <span className="text-xs text-black/50 truncate flex items-center gap-1">{subtitle}</span>}
      </span>
      {trailing && <span className="shrink-0">{trailing}</span>}
    </>
  );

  const rowClass = `flex w-full items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
    active ? 'bg-citadelle-cream' : ''
  } ${className}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} onMouseEnter={onMouseEnter} className={rowClass}>
        {content}
      </button>
    );
  }

  return <div className={rowClass}>{content}</div>;
}
