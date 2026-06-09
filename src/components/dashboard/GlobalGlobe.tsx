import { useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import type { CountryAIReadiness } from "@/types";
import { countryMap, mockCountries } from "@/data/mockCountries";
import { getMapFillColor } from "@/utils/scoreUtils";
import {
  getEnablerLabel,
  getReadinessBandFromScore,
  getReadinessBandLabel,
  getReadinessBandWidth,
  getScoreSortedEnablers,
} from "@/utils/displayNames";

const GEO_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

interface WorldCountryFeature {
  type: "Feature";
  properties?: {
    NAME?: string;
    NAME_LONG?: string;
    ADMIN?: string;
    ISO_A3?: string;
    ISO_A3_EH?: string;
    ADM0_A3?: string;
    GU_A3?: string;
    SU_A3?: string;
    SOV_A3?: string;
    [key: string]: unknown;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface WorldFeatureCollection {
  type: "FeatureCollection";
  features: WorldCountryFeature[];
}

interface GlobalGlobeProps {
  selected: CountryAIReadiness | null;
  onSelect: (country: CountryAIReadiness) => void;
}

const ISO3_ALIASES: Record<string, string[]> = {
  ARE: ["UAE"],
  UAE: ["ARE"],
  CHL: ["CHI"],
  CHI: ["CHL"],
  KOS: ["XKX"],
  XKX: ["KOS"],
  ROU: ["ROM"],
  ROM: ["ROU"],
  COD: ["ZAR"],
  ZAR: ["COD"],
  TLS: ["TMP"],
  TMP: ["TLS"],
};

function normalizeIso3(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  const normalized = String(value).trim().toUpperCase();

  if (!normalized || normalized === "-99") return null;

  return normalized;
}

function getFeatureIso3(
  featureData: object | null | undefined
): string | null {
  if (!featureData) return null;

  const featureCandidate = featureData as Partial<WorldCountryFeature>;
  const properties = featureCandidate.properties;

  if (!properties) return null;

  const candidates = [
    properties.ISO_A3,
    properties.ISO_A3_EH,
    properties.ADM0_A3,
    properties.GU_A3,
    properties.SU_A3,
    properties.SOV_A3,
  ];

  for (const candidate of candidates) {
    const iso3 = normalizeIso3(candidate);

    if (iso3) return iso3;
  }

  return null;
}

function getCountryFromFeature(
  featureData: object | null | undefined
): CountryAIReadiness | undefined {
  const iso3 = getFeatureIso3(featureData);

  if (!iso3) return undefined;

  const directMatch = countryMap.get(iso3);

  if (directMatch) return directMatch;

  const aliases = ISO3_ALIASES[iso3] ?? [];

  for (const alias of aliases) {
    const aliasMatch = countryMap.get(alias);

    if (aliasMatch) return aliasMatch;
  }

  return undefined;
}

function getCountryName(featureData: object | null | undefined): string {
  if (!featureData) return "Unknown";

  const featureCandidate = featureData as Partial<WorldCountryFeature>;
  const properties = featureCandidate.properties;

  return (
    properties?.NAME_LONG ??
    properties?.ADMIN ??
    properties?.NAME ??
    "Unknown"
  );
}

function getPillarColor(value: number) {
  if (value >= 70) return "#b9108f";
  if (value >= 55) return "#06b812";
  if (value >= 40) return "#f59e0b";
  return "#ef4444";
}

function collectCoordinatePairs(
  coordinates: unknown,
  output: [number, number][] = []
) {
  if (!Array.isArray(coordinates)) return output;

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    const lng = coordinates[0];
    const lat = coordinates[1];

    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      output.push([lng, lat]);
    }

    return output;
  }

  coordinates.forEach((child) => collectCoordinatePairs(child, output));

  return output;
}

function getFeatureCenter(featureData: WorldCountryFeature) {
  const points = collectCoordinatePairs(featureData.geometry.coordinates);

  if (points.length === 0) return null;

  const lat =
    points.reduce((sum, [, pointLat]) => sum + pointLat, 0) / points.length;

  const lngValues = points.map(([pointLng]) => pointLng);
  const minLng = Math.min(...lngValues);
  const maxLng = Math.max(...lngValues);

  const crossesAntimeridian = maxLng - minLng > 180;

  const adjustedLngValues = crossesAntimeridian
    ? lngValues.map((lng) => (lng < 0 ? lng + 360 : lng))
    : lngValues;

  let lng =
    adjustedLngValues.reduce((sum, pointLng) => sum + pointLng, 0) /
    adjustedLngValues.length;

  if (lng > 180) {
    lng -= 360;
  }

  return { lat, lng };
}

function useElementSize() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 900, height: 640 });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(entry.contentRect.width, 320),
        height: Math.max(entry.contentRect.height, 420),
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return {
    containerRef,
    width: size.width,
    height: size.height,
  };
}

const topCountries = [...mockCountries]
  .sort((a, b) => a.rank - b.rank)
  .slice(0, 5);

export default function GlobalGlobe({ selected, onSelect }: GlobalGlobeProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const { containerRef, width, height } = useElementSize();

  const [countries, setCountries] = useState<WorldCountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] =
    useState<CountryAIReadiness | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const displayCountry = hoveredCountry ?? selected ?? null;

  const pillarProfile = useMemo(() => {
    if (!displayCountry) return [];

    return getScoreSortedEnablers(displayCountry).map((enabler) => ({
      enabler,
      value: displayCountry.dimensions[enabler] ?? 0,
    }));
  }, [displayCountry]);

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      try {
        setLoadState("loading");

        const response = await fetch(GEO_URL);

        if (!response.ok) {
          throw new Error("Could not load world map");
        }

        const geoJson = (await response.json()) as WorldFeatureCollection;

        if (!cancelled) {
          setCountries(geoJson.features);
          setLoadState("ready");
        }
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    }

    loadCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const globe = globeRef.current;

      if (!globe) return;

      globe.pointOfView({ lat: 18, lng: 20, altitude: 2.15 }, 0);

      const controls = globe.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 180;
      controls.maxDistance = 520;
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [countries.length]);

  useEffect(() => {
    const globe = globeRef.current;

    if (!globe || countries.length === 0) return;

    const controls = globe.controls();

    if (!selected) {
      controls.autoRotate = true;
      return;
    }

    const selectedFeature = countries.find((featureData) => {
      const country = getCountryFromFeature(featureData);

      return country?.code === selected.code;
    });

    if (!selectedFeature) return;

    const center = getFeatureCenter(selectedFeature);

    if (!center) return;

    controls.autoRotate = false;

    globe.pointOfView(
      {
        lat: center.lat,
        lng: center.lng,
        altitude: 1.65,
      },
      1200
    );
  }, [selected, countries]);

  return (
    <div className="relative h-full min-h-[620px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
      <div ref={containerRef} className="absolute inset-0">
        {loadState === "ready" && (
          <Globe
            ref={globeRef}
            width={width}
            height={height}
            backgroundColor="rgba(2, 6, 23, 1)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            polygonsData={countries}
            polygonAltitude={(featureData: object) => {
              const country = getCountryFromFeature(featureData);

              if (!country) return 0.006;
              if (country.code === selected?.code) return 0.07;
              if (country.code === hoveredCountry?.code) return 0.055;

              return 0.026;
            }}
            polygonCapColor={(featureData: object) => {
              const country = getCountryFromFeature(featureData);

              if (!country) return "rgba(51, 65, 85, 0.35)";
              if (country.code === selected?.code) return "#f8fafc";

              return getMapFillColor(country.score);
            }}
            polygonSideColor={(featureData: object) => {
              const country = getCountryFromFeature(featureData);

              if (!country) return "rgba(15, 23, 42, 0.2)";
              if (country.code === selected?.code) {
                return "rgba(248, 250, 252, 0.75)";
              }

              return "rgba(15, 23, 42, 0.55)";
            }}
            polygonStrokeColor={(featureData: object) => {
              const country = getCountryFromFeature(featureData);

              if (!country) return "rgba(100, 116, 139, 0.18)";
              if (country.code === selected?.code) return "#ffffff";

              return "rgba(226, 232, 240, 0.45)";
            }}
            polygonLabel={(featureData: object) => {
              const country = getCountryFromFeature(featureData);

              if (!country) {
                return `
                  <div style="
                    background: rgba(15, 23, 42, 0.94);
                    border: 1px solid rgba(148, 163, 184, 0.35);
                    color: #e2e8f0;
                    border-radius: 12px;
                    padding: 10px 12px;
                    font-family: Inter, system-ui, sans-serif;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.35);
                  ">
                    <strong>${getCountryName(featureData)}</strong>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                      No AI Index data
                    </div>
                  </div>
                `;
              }

              return `
                <div style="
                  background: rgba(15, 23, 42, 0.96);
                  border: 1px solid rgba(148, 163, 184, 0.35);
                  color: #e2e8f0;
                  border-radius: 14px;
                  padding: 12px 14px;
                  font-family: Inter, system-ui, sans-serif;
                  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                  min-width: 170px;
                ">
                  <div style="font-weight: 800; font-size: 14px; color: #ffffff;">
                    ${country.name}
                  </div>
                  <div style="margin-top: 8px; font-size: 12px; color: #cbd5e1;">
                    Classification: <strong style="color:#ffffff;">${getReadinessBandLabel(country.classification)}</strong>
                  </div>
                  <div style="font-size: 12px; color: #cbd5e1;">
                    Region: <strong style="color:#ffffff;">${country.region}</strong>
                  </div>
                </div>
              `;
            }}
            onPolygonHover={(featureData: object | null) => {
              setHoveredCountry(getCountryFromFeature(featureData) ?? null);
            }}
            onPolygonClick={(featureData: object) => {
              const country = getCountryFromFeature(featureData);

              if (country) {
                onSelect(country);
              }
            }}
            polygonsTransitionDuration={320}
            atmosphereColor="#38bdf8"
            atmosphereAltitude={0.18}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.12),transparent_46%),linear-gradient(90deg,rgba(2,6,23,0.9),transparent_34%,transparent_66%,rgba(2,6,23,0.86))]" />

      <div className="absolute left-5 top-5 z-10 hidden w-[360px] max-w-[calc(100%-2.5rem)] space-y-3 text-white xl:block">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            AI Index by ITU
          </p>

          <h1 className="mt-2 text-2xl font-black tracking-tight">
            Global AI Readiness Globe
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            Explore how countries compare across Policy and governance, Infrastructure,
            Digital inclusion, Ecosystem, and Human capital development.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-200">
              {mockCountries.length} UN member states
            </span>
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-200">
              5 enablers
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl backdrop-blur-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Mature Example Cases
          </p>

          <div className="space-y-2">
            {topCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => onSelect(country)}
                className={`flex w-full items-center rounded-xl px-3 py-2 text-left transition ${
                  country.code === selected?.code
                    ? "bg-white text-slate-950"
                    : "bg-white/10 text-slate-200 hover:bg-white/15"
                }`}
              >
                <span className="truncate text-sm font-semibold">
                  {country.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute left-5 right-5 top-5 z-10 rounded-2xl border border-white/10 bg-slate-950/75 p-5 text-white shadow-2xl backdrop-blur-xl md:left-auto md:w-[340px]">
        {displayCountry ? (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Selected country
              </p>

              <h2 className="mt-1 text-2xl font-black">
                {displayCountry.name}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {displayCountry.region}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs text-slate-400">Classification</p>
              <p className="mt-1 text-2xl font-black">
                {getReadinessBandLabel(displayCountry.classification)}
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Enabler profile
              </p>

              {pillarProfile.map(({ enabler, value }) => (
                <div
                  key={enabler}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-200">
                      {getEnablerLabel(enabler)}
                    </span>

                    <span className="shrink-0 font-bold text-white">
                      {getReadinessBandFromScore(value)}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: getReadinessBandWidth(getReadinessBandFromScore(value)),
                        backgroundColor: getPillarColor(value),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex min-h-[260px] flex-col justify-center text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              Selected country
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">
              No country selected
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Click a highlighted country on the globe to inspect its AI
              readiness profile.
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-5 z-10 hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white shadow-2xl backdrop-blur-xl 2xl:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Score bands
        </p>

        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { color: "#b9108f", label: "Mature" },
            { color: "#06b812", label: "Developing" },
            { color: "#f59e0b", label: "Adopting" },
            { color: "#ef4444", label: "Early adopting" },
            { color: "rgba(51,65,85,0.8)", label: "No data" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {loadState === "loading" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950 text-white">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-300 border-t-transparent" />
            <p className="text-sm text-slate-300">Loading 3D globe...</p>
          </div>
        </div>
      )}

      {loadState === "error" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950 text-white">
          <div className="max-w-md rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-center">
            <p className="text-lg font-bold text-red-200">
              Could not load the 3D map
            </p>
            <p className="mt-2 text-sm text-slate-300">
              The globe needs access to the Natural Earth GeoJSON file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}