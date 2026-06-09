import { useState } from "react";
import type { CountryAIReadiness } from "@/types";
import { mockCountries } from "@/data/mockCountries";

export function useSelectedCountry(defaultCode = "USA") {
  const defaultCountry = mockCountries.find((c) => c.code === defaultCode) ?? mockCountries[0];
  const [selected, setSelected] = useState<CountryAIReadiness>(defaultCountry);

  function selectByCode(code: string) {
    const country = mockCountries.find((c) => c.code === code);
    if (country) setSelected(country);
  }

  return { selected, setSelected, selectByCode };
}
