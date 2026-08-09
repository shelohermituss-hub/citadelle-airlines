import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useBooking } from '@/contexts/BookingContext';
import { BookingSummary } from './PassengersPage';
import { generateSeatMap, getUnavailableSeats } from '@/data/seatMap';
import { PET_FEE_USD } from '@/data/ancillaries';
import { convertUsd } from '@/data/mockOffers';
import { SeatGrid2D } from '@/components/SeatGrid2D';
import { canRender3D } from '@/utils/deviceCapabilities';
import type { AircraftCode } from '@/data/fleet';
import { FcLeft, FcRight, FcOk } from 'react-icons/fc';

const SeatMap3D = lazy(() => import('@/components/SeatMap3D').then((m) => ({ default: m.SeatMap3D })));

const ROWS_PER_PAGE = 6;

export default function SeatsPage() {
  const { t, currency, formatPrice } = useI18n();
  const { outboundResult, fareFamily, passengers, setPassengers, totalPrice, setAncillariesTotal } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    if (!outboundResult) navigate('/search');
    else if (passengers.length === 0) navigate('/booking/passengers');
  }, [outboundResult, passengers.length, navigate]);

  const [support3D] = useState(() => canRender3D());
  const [view, setView] = useState<'3d' | '2d'>(() => (canRender3D() ? '3d' : '2d'));
  const [page, setPage] = useState(0);
  const [activePaxId, setActivePaxId] = useState<string | null>(null);

  const seatPassengers = useMemo(() => passengers.filter((p) => p.travelerType !== 'HELD_INFANT'), [passengers]);

  useEffect(() => {
    if (activePaxId) return;
    const firstUnseated = seatPassengers.find((p) => !p.seatNumber);
    setActivePaxId((firstUnseated ?? seatPassengers[0])?.id ?? null);
  }, [activePaxId, seatPassengers]);

  const aircraftCode = (outboundResult?.outbound.segments[0].aircraft.code ?? '320') as AircraftCode;
  const seatMap = useMemo(() => generateSeatMap(aircraftCode), [aircraftCode]);
  const flightKey = outboundResult ? `${outboundResult.outbound.segments[0].number}-${outboundResult.departureTime}` : '';
  const unavailableIds = useMemo(
    () => (outboundResult ? getUnavailableSeats(flightKey, seatMap, fareFamily) : new Set<string>()),
    [flightKey, seatMap, fareFamily, outboundResult],
  );

  const classRows = seatMap.rowsByClass[fareFamily];
  const totalPages = Math.max(1, Math.ceil(classRows.length / ROWS_PER_PAGE));
  const visibleRows = classRows.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const classSeats = useMemo(() => seatMap.seats.filter((s) => s.cabinClass === fareFamily), [seatMap, fareFamily]);
  const visibleSeats = useMemo(() => classSeats.filter((s) => visibleRows.includes(s.row)), [classSeats, visibleRows]);

  const seatById = useMemo(() => new Map(classSeats.map((s) => [s.id, s])), [classSeats]);

  const assignedSeatsOther = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of seatPassengers) {
      if (p.id === activePaxId || !p.seatNumber) continue;
      map.set(p.seatNumber, initials(p));
    }
    return map;
  }, [seatPassengers, activePaxId]);

  const activeSeatId = seatPassengers.find((p) => p.id === activePaxId)?.seatNumber;

  const assignSeat = useCallback(
    (seatId: string) => {
      if (!activePaxId) return;
      if (unavailableIds.has(seatId) || assignedSeatsOther.has(seatId)) return;
      const updated = passengers.map((p) => (p.id === activePaxId ? { ...p, seatNumber: seatId } : p));
      setPassengers(updated);
      const nextUnseated = seatPassengers.find((p) => p.id !== activePaxId && !p.seatNumber);
      if (nextUnseated) setActivePaxId(nextUnseated.id);
    },
    [activePaxId, unavailableIds, assignedSeatsOther, passengers, setPassengers, seatPassengers],
  );

  function autoAssignRemaining() {
    const taken = new Set([...unavailableIds, ...passengers.filter((p) => p.seatNumber).map((p) => p.seatNumber!)]);
    const available = classSeats.filter((s) => !taken.has(s.id));
    let cursor = 0;
    const updated = passengers.map((p) => {
      if (p.travelerType === 'HELD_INFANT' || p.seatNumber) return p;
      const seat = available[cursor];
      cursor++;
      return seat ? { ...p, seatNumber: seat.id } : p;
    });
    setPassengers(updated);
  }

  const allSeated = seatPassengers.every((p) => p.seatNumber);

  const seatSurchargeUsd = seatPassengers.reduce((sum, p) => {
    if (!p.seatNumber) return sum;
    return sum + (seatById.get(p.seatNumber)?.priceUsd ?? 0);
  }, 0);
  const petFeeUsd = passengers.reduce((sum, p) => {
    if (!p.travelingWithPet || !p.petType) return sum;
    return sum + PET_FEE_USD[p.petType];
  }, 0);
  const extrasInCurrency = convertUsd(seatSurchargeUsd + petFeeUsd, currency);

  function handleContinue() {
    setAncillariesTotal(extrasInCurrency);
    navigate('/booking/payment');
  }

  if (!outboundResult) return null;

  return (
    <div className="container-page py-6">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('seats.title')}</h1>
            <p className="text-sm text-black/50 mt-1">{t('seats.subtitle')}</p>
          </div>

          {/* Passenger chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {seatPassengers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePaxId(p.id)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                  p.id === activePaxId
                    ? 'bg-citadelle-black text-citadelle-gold border-citadelle-black'
                    : 'bg-white text-citadelle-black border-black/10 hover:border-citadelle-gold/50'
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-citadelle-gold/15 text-[0.65rem] font-bold text-citadelle-gold-dark">
                  {initials(p)}
                </span>
                {p.firstName || `${t('passengers.passenger', { n: seatPassengers.indexOf(p) + 1 })}`}
                <span className="text-xs opacity-60">{p.seatNumber ?? t('seats.noSeat')}</span>
              </button>
            ))}
          </div>

          {/* View toggle */}
          {support3D && (
            <div className="flex rounded-full bg-citadelle-cream p-1 w-fit mb-3">
              <button
                type="button"
                onClick={() => setView('3d')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === '3d' ? 'bg-white text-citadelle-black shadow-sm' : 'text-black/50'}`}
              >
                {t('seats.view3d')}
              </button>
              <button
                type="button"
                onClick={() => setView('2d')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === '2d' ? 'bg-white text-citadelle-black shadow-sm' : 'text-black/50'}`}
              >
                {t('seats.view2d')}
              </button>
            </div>
          )}

          {view === '3d' && support3D && (
            <div className="card p-3 mb-4">
              <div className="relative h-[300px] sm:h-[360px]">
                <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-black/30 text-sm">{t('common.loading')}</div>}>
                  <SeatMap3D
                    seats={visibleSeats}
                    layout={seatMap.layout}
                    unavailableIds={unavailableIds}
                    assignedSeats={assignedSeatsOther}
                    activeSeatId={activeSeatId}
                    onSelectSeat={assignSeat}
                    bodyType={seatMap.bodyType}
                  />
                </Suspense>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label={t('seats.prevRows')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-citadelle-black shadow-elevated hover:bg-white transition-colors disabled:opacity-30"
                >
                  <FcLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  aria-label={t('seats.nextRows')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-citadelle-black shadow-elevated hover:bg-white transition-colors disabled:opacity-30"
                >
                  <FcRight className="h-5 w-5" />
                </button>
              </div>
              <p className="text-center text-xs text-black/40 mt-2">
                {t('seats.rowsShown', { from: visibleRows[0], to: visibleRows[visibleRows.length - 1], total: classRows.length })}
              </p>
            </div>
          )}

          {(view === '2d' || !support3D) && (
            <div className="card p-4 mb-4">
              <SeatGrid2D
                seats={classSeats}
                layout={seatMap.layout}
                unavailableIds={unavailableIds}
                assignedSeats={assignedSeatsOther}
                activeSeatId={activeSeatId}
                onSelectSeat={assignSeat}
              />
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-black/50 mb-4">
            <LegendItem swatch="bg-white border border-black/10" label={t('seats.legend.available')} />
            <LegendItem swatch="bg-citadelle-gold/25 border border-citadelle-gold/50" label={t('seats.legend.preferred')} />
            <LegendItem swatch="bg-citadelle-gold/80 border border-citadelle-gold" label={t('seats.legend.extraLegroom')} />
            <LegendItem swatch="bg-citadelle-gold" label={t('seats.legend.selected')} />
            <LegendItem swatch="bg-black/10" label={t('seats.legend.taken')} />
          </div>

          {!allSeated && (
            <button type="button" onClick={autoAssignRemaining} className="btn-outline mb-4">
              {t('seats.autoAssign')}
            </button>
          )}

          <div className="flex justify-between mt-2">
            <Link to="/booking/passengers" className="btn-ghost">
              <FcLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
            <button onClick={handleContinue} disabled={!allSeated} className="btn-primary">
              {t('common.continue')}
              <FcRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary sidebar */}
        <aside>
          <div className="space-y-4">
            <BookingSummary />
            <div className="card p-5">
              <h3 className="font-semibold text-citadelle-black mb-3 flex items-center gap-2">
                <FcOk className="h-4 w-4" />
                {t('seats.seatTotal')}
              </h3>
              <div className="space-y-2 text-sm">
                {seatPassengers.map((p) => {
                  const seat = p.seatNumber ? seatById.get(p.seatNumber) : undefined;
                  return (
                    <div key={p.id} className="flex justify-between">
                      <span className="text-black/50">{p.firstName || initials(p)} — {p.seatNumber ?? t('seats.noSeat')}</span>
                      <span className="font-medium">{seat && seat.priceUsd > 0 ? formatPrice(convertUsd(seat.priceUsd, currency)) : t('seats.included')}</span>
                    </div>
                  );
                })}
                {petFeeUsd > 0 && (
                  <div className="flex justify-between">
                    <span className="text-black/50">{t('passengers.pet.question')}</span>
                    <span className="font-medium">{formatPrice(convertUsd(petFeeUsd, currency))}</span>
                  </div>
                )}
                <div className="border-t border-black/[0.06] pt-2 flex justify-between items-center">
                  <span className="text-black/50">{t('common.total')}</span>
                  <span className="font-display text-xl font-bold text-citadelle-black">{formatPrice(totalPrice + extrasInCurrency)}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function initials(p: { firstName: string; lastName: string }): string {
  return `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase() || '—';
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-sm ${swatch}`} />
      {label}
    </span>
  );
}
