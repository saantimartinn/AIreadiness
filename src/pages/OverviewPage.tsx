import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import GlobalGlobe from "@/components/dashboard/GlobalGlobe";
import { countryMap } from "@/data/mockCountries";
import type { CountryAIReadiness } from "@/types";

export default function OverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const countryCodeFromUrl =
    searchParams.get("country")?.trim().toUpperCase() ?? null;

  const selected = useMemo(() => {
    if (!countryCodeFromUrl) return null;

    return countryMap.get(countryCodeFromUrl) ?? null;
  }, [countryCodeFromUrl]);

  const handleSelectCountry = (country: CountryAIReadiness) => {
    setSearchParams({ country: country.code });
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] min-h-[620px] lg:h-[calc(100vh-6.5rem)]">
      <GlobalGlobe selected={selected} onSelect={handleSelectCountry} />
    </div>
  );
}