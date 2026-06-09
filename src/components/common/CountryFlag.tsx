import { useMemo, useState } from "react";
import isoCountries from "i18n-iso-countries";

interface CountryFlagProps {
  countryCode: string;
  countryName: string;
  size?: "sm" | "md" | "lg";
}

const SPECIAL_ISO3_TO_ISO2: Record<string, string> = {
  ARE: "ae",
  UAE: "ae",
  XKX: "xk",
  KOS: "xk",
  ROM: "ro",
  CHI: "gg",
};

const SIZE_CLASSES = {
  sm: "h-5 w-7 text-sm",
  md: "h-7 w-10 text-lg",
  lg: "h-10 w-14 text-2xl",
};

function getIso2(countryCode: string) {
  const normalizedCode = countryCode.trim().toUpperCase();

  if (SPECIAL_ISO3_TO_ISO2[normalizedCode]) {
    return SPECIAL_ISO3_TO_ISO2[normalizedCode];
  }

  const iso2 = isoCountries.alpha3ToAlpha2(normalizedCode);

  return iso2 ? iso2.toLowerCase() : null;
}

export default function CountryFlag({
  countryCode,
  countryName,
  size = "md",
}: CountryFlagProps) {
  const [hasError, setHasError] = useState(false);

  const iso2 = useMemo(() => getIso2(countryCode), [countryCode]);

  if (!iso2 || hasError) {
    return (
      <div
        className={`${SIZE_CLASSES[size]} flex items-center justify-center rounded-md bg-slate-100 ring-1 ring-slate-200`}
        title={countryName}
        aria-label={`${countryName} flag not available`}
      >
        <span aria-hidden="true">🌍</span>
      </div>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${iso2}.png`}
      srcSet={`https://flagcdn.com/w160/${iso2}.png 2x`}
      alt={`${countryName} flag`}
      title={countryName}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${SIZE_CLASSES[size]} rounded-md object-cover shadow-sm ring-1 ring-slate-200`}
    />
  );
}