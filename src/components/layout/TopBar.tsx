import { useMemo, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockCountries } from "@/data/mockCountries";
import { getReadinessBandLabel } from "@/utils/displayNames";

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function TopBar({ onMenuClick, title }: TopBarProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return mockCountries
      .filter(
        (country) =>
          country.name.toLowerCase().includes(query) ||
          country.code.toLowerCase().includes(query) ||
          country.region.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [search]);

  const showResults = isSearchFocused && search.trim().length > 0;

  const selectCountry = (countryCode: string) => {
    setSearch("");
    setIsSearchFocused(false);
    navigate(`/?country=${countryCode}`);
  };

  const handleSubmit = () => {
    if (results.length > 0) {
      selectCountry(results[0].code);
    }
  };

  return (
    <header className="sticky top-0 z-[100] flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {title && (
          <h1 className="hidden truncate text-sm font-semibold text-slate-700 sm:block">
            {title}
          </h1>
        )}
      </div>

      <div className="relative z-[101] w-full max-w-[360px]">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 transition focus-within:border-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10">
          <Search size={15} className="shrink-0 text-slate-400" />

          <input
            type="text"
            value={search}
            placeholder="Search countries..."
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => {
              window.setTimeout(() => setIsSearchFocused(false), 150);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSubmit();
              }

              if (event.key === "Escape") {
                setSearch("");
                setIsSearchFocused(false);
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showResults && (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[9999] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto p-1.5">
                {results.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectCountry(country.code)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-100"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {country.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {country.region}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">
                      {getReadinessBandLabel(country.classification)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  No countries found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try another name or ISO3 code.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}