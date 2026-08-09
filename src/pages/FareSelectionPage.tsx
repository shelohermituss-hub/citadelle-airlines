import { useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/i18n/I18nContext';
import { useBooking } from '@/contexts/BookingContext';
import { FARE_FAMILIES, FARE_FAMILY_ORDER } from '@/data/fareFamilies';
import { getAirport } from '@/data/airports';
import type { FareFamily, FlightOffer, FlightResult } from '@/data/types';
import { Plane } from 'lucide-react';
import { FcCheckmark, FcCancel, FcRight, FcLeft, FcClock, FcCollaboration } from 'react-icons/fc';

export default function FareSelectionPage() {
  const { t, locale, formatPrice, formatTime, formatDate, formatDuration } = useI18n();
  const { outboundResult, returnResult, fareFamily, setFareFamily, setSelectedOffers, setTotalPrice, criteria } = useBooking();
  const navigate = useNavigate();

  // If no outbound selected, redirect to search
  useEffect(() => {
    if (!outboundResult) {
      navigate('/search');
    }
  }, [outboundResult, navigate]);

  // Calculate total price for each fare family
  // (all hooks must run unconditionally on every render — the
  // outboundResult null-guard only affects what we render, below)
  const fareTotals = useMemo(() => {
    const totals: Record<FareFamily, number> = {} as Record<FareFamily, number>;
    if (!outboundResult) return totals;
    for (const fare of FARE_FAMILY_ORDER) {
      const def = FARE_FAMILIES[fare];
      const baseOutbound = outboundResult.pricePerAdult / FARE_FAMILIES[outboundResult.fareFamily].priceMultiplier;
      const outboundTotal = baseOutbound * def.priceMultiplier * (criteria?.adults ?? 1);
      let returnTotal = 0;
      if (returnResult) {
        const baseReturn = returnResult.pricePerAdult / FARE_FAMILIES[returnResult.fareFamily].priceMultiplier;
        returnTotal = baseReturn * def.priceMultiplier * (criteria?.adults ?? 1);
      }
      // Add child and infant prorated
      const childRatio = 0.75;
      const infantRatio = 0.1;
      const children = criteria?.children ?? 0;
      const infants = criteria?.infants ?? 0;
      const childTotal = (outboundTotal + returnTotal) * childRatio * (children / (criteria?.adults ?? 1));
      const infantTotal = (outboundTotal + returnTotal) * infantRatio * (infants / (criteria?.adults ?? 1));
      totals[fare] = Math.round(outboundTotal + returnTotal + childTotal + infantTotal);
    }
    return totals;
  }, [outboundResult, returnResult, criteria]);

  useEffect(() => {
    if (!outboundResult) return;
    setTotalPrice(fareTotals[fareFamily]);
  }, [outboundResult, fareTotals, fareFamily, setTotalPrice]);

  if (!outboundResult) return null;

  function handleContinue() {
    if (!outboundResult) return;
    // Rebuild offers with the selected fare family
    const offers: FlightOffer[] = [rebuildOffer(outboundResult, fareFamily)];
    if (returnResult) offers.push(rebuildOffer(returnResult, fareFamily));
    setSelectedOffers(offers);
    setTotalPrice(fareTotals[fareFamily]);
    navigate('/booking/passengers');
  }

  function rebuildOffer(result: FlightResult, fare: FareFamily): FlightOffer {
    const offer = { ...result.offer };
    const def = FARE_FAMILIES[fare];
    const cabin = fare === 'BUSINESS' ? 'BUSINESS' : 'ECONOMY';
    const bookingClass = fare === 'BUSINESS' ? 'J' : fare === 'ECO_FLEX' ? 'Y' : 'B';
    offer.itineraries = offer.itineraries.map((it) => ({
      ...it,
      segments: it.segments.map((seg) => ({ ...seg, cabin, class: bookingClass })),
    }));
    offer.travelerPricings = offer.travelerPricings.map((tp) => ({
      ...tp,
      fareFamily: fare,
      fareDetailsBySegment: tp.fareDetailsBySegment.map((fd) => ({
        ...fd,
        cabin,
        brandedFare: fare,
        includedCabinBags: def.includedCabinBags,
        includedCheckedBags: def.includedCheckedBags,
        isModificationIncluded: def.isModificationIncluded,
        isRefundable: def.isRefundable,
        isSeatSelectionIncluded: def.isSeatSelectionIncluded,
        isPriorityBoardingIncluded: def.isPriorityBoardingIncluded,
        isMealIncluded: def.isMealIncluded,
      })),
    }));
    return offer;
  }

  function getCityName(iata: string): string {
    const a = getAirport(iata);
    if (!a) return iata;
    if (locale === 'fr') return a.cityFr;
    if (locale === 'ht') return a.cityHt;
    return a.cityEn;
  }

  return (
    <div className="container-page py-6">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div>
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-citadelle-black">{t('fare.title')}</h1>
            <p className="text-sm text-black/50 mt-1">{t('fare.subtitle')}</p>
          </div>

          {/* Itinerary summary */}
          <div className="card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Plane className="h-4 w-4 text-citadelle-gold-dark" />
              <span className="font-semibold">{getCityName(outboundResult.outbound.segments[0].departure.iataCode)}</span>
              <FcRight className="h-4 w-4" />
              <span className="font-semibold">{getCityName(outboundResult.outbound.segments[outboundResult.outbound.segments.length - 1].arrival.iataCode)}</span>
              <span className="text-black/40">·</span>
              <span className="text-black/60">{formatDate(criteria?.departureDate ?? outboundResult.departureTime)}</span>
              <span className="text-black/40">·</span>
              <span className="text-black/60">{formatTime(outboundResult.departureTime)} → {formatTime(outboundResult.arrivalTime)}</span>
            </div>
            {returnResult && (
              <div className="flex flex-wrap items-center gap-3 text-sm mt-3 pt-3 border-t border-black/[0.06]">
                <Plane className="h-4 w-4 text-citadelle-gold-dark rotate-180" />
                <span className="font-semibold">{getCityName(returnResult.outbound.segments[0].departure.iataCode)}</span>
                <FcRight className="h-4 w-4" />
                <span className="font-semibold">{getCityName(returnResult.outbound.segments[returnResult.outbound.segments.length - 1].arrival.iataCode)}</span>
                <span className="text-black/40">·</span>
                <span className="text-black/60">{formatDate(criteria?.returnDate ?? returnResult.departureTime)}</span>
              </div>
            )}
          </div>

          {/* Fare comparison cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {FARE_FAMILY_ORDER.map((fare) => {
              const def = FARE_FAMILIES[fare];
              const isSelected = fareFamily === fare;
              const label = fare === 'ECO' ? t('fare.eco') : fare === 'ECO_FLEX' ? t('fare.ecoFlex') : t('fare.business');
              const isPremium = fare === 'BUSINESS';

              return (
                <div
                  key={fare}
                  className={`card p-5 cursor-pointer transition-all relative ${
                    isPremium
                      ? `bg-gradient-to-br from-citadelle-black to-citadelle-black-soft ${isSelected ? 'ring-2 ring-citadelle-gold' : 'hover:ring-1 hover:ring-citadelle-gold/40'}`
                      : isSelected ? 'ring-2 ring-citadelle-gold border-citadelle-gold' : 'hover:border-citadelle-gold/30'
                  }`}
                  onClick={() => setFareFamily(fare)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFareFamily(fare); } }}
                >
                  {isPremium && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 chip bg-citadelle-gold text-citadelle-black text-[0.625rem]">
                      ★
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <h3 className={`font-display text-lg font-bold ${isPremium ? 'text-white' : 'text-citadelle-black'}`}>{label}</h3>
                    <p className={`font-display text-2xl font-bold mt-1 ${isPremium ? 'text-citadelle-gold' : 'text-citadelle-gold-dark'}`}>
                      {formatPrice(fareTotals[fare])}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <FareFeature
                      dark={isPremium}
                      label={t('fare.cabinBag')}
                      status={def.includedCabinBags > 0 ? 'included' : 'notAvailable'}
                      value={def.includedCabinBags > 0 ? `${def.includedCabinBags}` : ''}
                    />
                    <FareFeature
                      dark={isPremium}
                      label={t('fare.checkedBag')}
                      status={def.includedCheckedBags > 0 ? 'included' : 'notAvailable'}
                      value={def.includedCheckedBags > 0 ? `${def.includedCheckedBags}` : ''}
                    />
                    <FareFeature
                      dark={isPremium}
                      label={t('fare.modification')}
                      status={def.isModificationIncluded ? 'included' : def.modificationFeeUsd ? 'paid' : 'notAvailable'}
                      value={def.modificationFeeUsd ? formatPrice(def.modificationFeeUsd) : ''}
                    />
                    <FareFeature
                      dark={isPremium}
                      label={t('fare.refund')}
                      status={def.isRefundable ? 'included' : 'notAvailable'}
                    />
                    <FareFeature
                      dark={isPremium}
                      label={t('fare.seatSelection')}
                      status={def.isSeatSelectionIncluded ? 'included' : 'notAvailable'}
                    />
                    <FareFeature
                      dark={isPremium}
                      label={t('fare.priority')}
                      status={def.isPriorityBoardingIncluded ? 'included' : 'notAvailable'}
                    />
                    <FareFeature
                      dark={isPremium}
                      label={t('fare.meal')}
                      status={def.isMealIncluded ? 'included' : 'notAvailable'}
                    />
                  </div>

                  <button
                    className={`mt-4 w-full text-sm font-semibold py-2.5 rounded-full transition-all ${
                      isPremium
                        ? isSelected ? 'bg-citadelle-gold text-citadelle-black' : 'bg-white/10 text-white hover:bg-white/20'
                        : isSelected ? 'bg-citadelle-gold text-citadelle-black' : 'bg-citadelle-cream text-citadelle-black hover:bg-citadelle-gold/20'
                    }`}
                    onClick={(e) => { e.stopPropagation(); setFareFamily(fare); }}
                  >
                    {isSelected ? t('fare.selected') : t('fare.select', { fare: label })}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-6">
            <Link to="/search" className="btn-ghost">
              <FcLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
            <button onClick={handleContinue} className="btn-primary">
              {t('common.continue')}
              <FcRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Summary sidebar */}
        <aside>
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-citadelle-black mb-4">{t('fare.summary')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-black/60">
                <FcCollaboration className="h-4 w-4" />
                <span>{(criteria?.adults ?? 0) + (criteria?.children ?? 0) + (criteria?.infants ?? 0)} {t('common.passengers').toLowerCase()}</span>
              </div>
              <div className="flex items-center gap-2 text-black/60">
                <FcClock className="h-4 w-4" />
                <span>{formatDuration(outboundResult.durationMin)}</span>
              </div>
              <div className="border-t border-black/[0.06] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-black/50">{t('common.total')}</span>
                  <span className="font-display text-xl font-bold text-citadelle-black">{formatPrice(fareTotals[fareFamily])}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FareFeature({
  label,
  status,
  value,
  dark = false,
}: {
  label: string;
  status: 'included' | 'paid' | 'notAvailable';
  value?: string;
  dark?: boolean;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-xs ${dark ? 'text-white/60' : 'text-black/60'}`}>{label}</span>
      <div className="flex items-center gap-1 shrink-0">
        {status === 'included' && (
          <>
            <FcCheckmark className="h-3.5 w-3.5" />
            <span className={`text-xs font-medium ${dark ? 'text-citadelle-gold' : 'text-citadelle-success'}`}>{value || t('fare.included')}</span>
          </>
        )}
        {status === 'paid' && (
          <>
            <span className={`text-xs font-medium ${dark ? 'text-citadelle-gold' : 'text-citadelle-gold-dark'}`}>{value || t('fare.paid')}</span>
          </>
        )}
        {status === 'notAvailable' && (
          <>
            <FcCancel className="h-3.5 w-3.5 opacity-40" />
            <span className={`text-xs ${dark ? 'text-white/30' : 'text-black/30'}`}>{t('fare.notAvailable')}</span>
          </>
        )}
      </div>
    </div>
  );
}
