import { useState } from 'react';
import { FcLeft, FcRight, FcCollaboration, FcPositiveDynamic, FcRuler, FcExpand } from 'react-icons/fc';
import { useI18n } from '@/i18n/I18nContext';
import { Airplane3D } from './Airplane3D';
import { StatTile } from './StatTile';
import { FLEET, totalSeats } from '@/data/fleet';

export function FleetCarousel() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const aircraft = FLEET[index];

  function prev() {
    setIndex((i) => (i - 1 + FLEET.length) % FLEET.length);
  }
  function next() {
    setIndex((i) => (i + 1) % FLEET.length);
  }

  return (
    <div className="w-full">
      <div className="relative h-[220px] sm:h-[260px] lg:h-[300px]">
        <Airplane3D bodyType={aircraft.bodyType} />

        <button
          type="button"
          onClick={prev}
          aria-label={t('fleet.prev')}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-citadelle-black shadow-elevated hover:bg-white transition-colors"
        >
          <FcLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label={t('fleet.next')}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-citadelle-black shadow-elevated hover:bg-white transition-colors"
        >
          <FcRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {FLEET.map((a, i) => (
          <button
            key={a.code}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={t(a.nameKey)}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-citadelle-gold' : 'w-1.5 bg-black/15 hover:bg-black/25'
            }`}
          />
        ))}
      </div>

      {/* Spec panel */}
      <div key={aircraft.code} className="mt-3 text-center animate-fade-in">
        <p className="font-display text-base font-bold text-citadelle-black">{t(aircraft.nameKey)}</p>
        <p className="text-sm text-black/50 mt-0.5">{t(aircraft.taglineKey)}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          <StatTile delay={0} icon={FcCollaboration} label={t('fleet.seats')} value={String(totalSeats(aircraft.seats))} />
          <StatTile delay={60} icon={FcRuler} label={t('fleet.range')} value={`${aircraft.rangeKm.toLocaleString()} km`} />
          <StatTile delay={120} icon={FcPositiveDynamic} label={t('fleet.speed')} value={`${aircraft.cruiseSpeedKmh} km/h`} />
          <StatTile delay={180} icon={FcExpand} label={t('fleet.wingspan')} value={`${aircraft.wingspanM} m`} />
        </div>
      </div>
    </div>
  );
}
