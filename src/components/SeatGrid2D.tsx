import type { Seat } from '@/data/seatMap';

interface SeatGrid2DProps {
  seats: Seat[];
  layout: string[][];
  unavailableIds: Set<string>;
  assignedSeats: Map<string, string>;
  activeSeatId?: string;
  onSelectSeat: (id: string) => void;
}

export function SeatGrid2D({ seats, layout, unavailableIds, assignedSeats, activeSeatId, onSelectSeat }: SeatGrid2DProps) {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort((a, b) => a - b);
  const byRowCol = new Map(seats.map((s) => [`${s.row}${s.column}`, s]));

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1.5 min-w-full items-center">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-6 text-right text-xs font-semibold text-black/40 tabular-nums">{row}</span>
            {layout.map((group, gi) => (
              <div key={gi} className="flex gap-1.5">
                {group.map((col) => {
                  const seat = byRowCol.get(`${row}${col}`);
                  if (!seat) return <div key={col} className="h-9 w-9" />;
                  const isActive = seat.id === activeSeatId;
                  const isUnavailable = unavailableIds.has(seat.id);
                  const assignee = assignedSeats.get(seat.id);
                  const isAssignedOther = !!assignee;
                  const disabled = isUnavailable || isAssignedOther;

                  let classes = 'h-9 w-9 rounded-lg text-[0.6rem] font-bold flex items-center justify-center transition-all border';
                  if (isActive) {
                    classes += ' bg-citadelle-gold border-citadelle-gold text-citadelle-black scale-110 shadow-card';
                  } else if (isUnavailable) {
                    classes += ' bg-black/10 border-transparent text-black/20 cursor-not-allowed';
                  } else if (isAssignedOther) {
                    classes += ' bg-citadelle-black border-citadelle-black text-citadelle-gold cursor-not-allowed';
                  } else if (seat.tier === 'extraLegroom') {
                    classes += ' bg-citadelle-gold/80 border-citadelle-gold text-citadelle-black hover:bg-citadelle-gold';
                  } else if (seat.tier === 'preferred') {
                    classes += ' bg-citadelle-gold/25 border-citadelle-gold/50 text-citadelle-black hover:bg-citadelle-gold/40';
                  } else {
                    classes += ' bg-white border-black/10 text-citadelle-black hover:border-citadelle-gold hover:bg-citadelle-gold/10';
                  }

                  return (
                    <button
                      key={col}
                      type="button"
                      disabled={disabled}
                      onClick={() => onSelectSeat(seat.id)}
                      aria-label={`Siège ${seat.id}${seat.priceUsd > 0 ? `, +$${seat.priceUsd}` : ''}${disabled ? ', indisponible' : ''}`}
                      aria-pressed={isActive}
                      className={classes}
                      title={isAssignedOther ? `${seat.id} — ${assignee}` : seat.id}
                    >
                      {isAssignedOther ? assignee : col}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
