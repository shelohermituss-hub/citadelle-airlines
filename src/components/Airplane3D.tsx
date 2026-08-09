import { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { Plane } from 'lucide-react';
import type { BodyType, AircraftCode } from '@/data/fleet';
import { supportsWebGL, prefersReducedMotion, isSlowConnection } from '@/utils/deviceCapabilities';

const ThreeAirplane = lazy(() => import('./ThreeAirplane'));

export function Airplane3D({ bodyType = 'narrow', aircraftCode }: { bodyType?: BodyType; aircraftCode?: AircraftCode }) {
  const [canRender3D, setCanRender3D] = useState(false);
  const [, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supportsWebGL() || prefersReducedMotion() || isSlowConnection()) {
      setCanRender3D(false);
      return;
    }
    // Defer 3D loading until after main content paints
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCanRender3D(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!canRender3D) {
    // Static fallback — a stylized airplane illustration
    return (
      <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full max-w-md aspect-[16/10] flex items-center justify-center">
          {/* Static airplane illustration */}
          <svg
            viewBox="0 0 400 250"
            className="w-full h-full drop-shadow-2xl animate-float"
            style={bodyType === 'wide' ? { transform: 'scaleX(1.08)' } : undefined}
            role="img"
            aria-label="Citadelle Airlines aircraft"
          >
            <defs>
              <linearGradient id="fuselage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E8E5E0" />
              </linearGradient>
              <linearGradient id="wing" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#D0CDC8" />
                <stop offset="100%" stopColor="#B5B2AD" />
              </linearGradient>
            </defs>
            {/* Fuselage */}
            <ellipse cx="200" cy="125" rx="160" ry="22" fill="url(#fuselage)" stroke="#C8C5C0" strokeWidth="0.5" />
            {/* Nose */}
            <ellipse cx="345" cy="125" rx="18" ry="20" fill="url(#fuselage)" />
            {/* Tail fin with checker pattern */}
            <path d="M40 125 L70 70 L100 125 Z" fill="#F7F6F3" stroke="#C8C5C0" strokeWidth="0.5" />
            <path d="M70 70 L100 125 L85 125 L70 95 Z" fill="#F2A81D" />
            <path d="M70 95 L85 125 L75 125 L70 110 Z" fill="#141414" />
            {/* Horizontal stabilizer */}
            <path d="M35 125 L75 110 L75 140 Z" fill="url(#wing)" />
            {/* Main wings */}
            <path d="M180 125 L120 175 L140 175 L200 135 Z" fill="url(#wing)" />
            <path d="M180 125 L120 75 L140 75 L200 115 Z" fill="url(#wing)" />
            {/* Engines */}
            <ellipse cx="135" cy="160" rx="14" ry="8" fill="#3a3a3a" />
            <ellipse cx="135" cy="90" rx="14" ry="8" fill="#3a3a3a" />
            {/* Windows */}
            <g fill="#141414" opacity="0.6">
              {Array.from({ length: 18 }).map((_, i) => (
                <circle key={i} cx={90 + i * 14} cy="120" r="1.5" />
              ))}
            </g>
            {/* Stripe */}
            <rect x="40" y="123" width="300" height="3" fill="#F2A81D" opacity="0.8" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-float">
              <Plane className="h-16 w-16 text-citadelle-gold/40" />
            </div>
          </div>
        }
      >
        <ThreeAirplane onLoad={() => setLoaded(true)} bodyType={bodyType} aircraftCode={aircraftCode} />
      </Suspense>
    </div>
  );
}
