import {
  HT,
  CA,
  US,
  DO,
  CU,
  BR,
  CL,
  TR,
  BS,
  JM,
  GP,
  CW,
  NI,
  GY,
  FR,
  SR,
  ES,
  PA,
  AG,
  BB,
  MX,
  IT,
} from 'country-flag-icons/react/3x2';

/** Only the countries actually served by the Citadelle network — avoids bundling all ~250 flags. */
const FLAGS: Record<string, typeof HT> = {
  HT,
  CA,
  US,
  DO,
  CU,
  BR,
  CL,
  TR,
  BS,
  JM,
  GP,
  CW,
  NI,
  GY,
  FR,
  SR,
  ES,
  PA,
  AG,
  BB,
  MX,
  IT,
};

export function Flag({
  countryCode,
  className = '',
}: {
  countryCode: string;
  className?: string;
}) {
  const FlagIcon = FLAGS[countryCode.toUpperCase()];
  if (!FlagIcon) return null;
  return (
    <FlagIcon
      className={`inline-block rounded-[2px] object-cover ${className}`}
      aria-hidden="true"
    />
  );
}
