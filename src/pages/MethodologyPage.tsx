import type { ReactNode } from "react";
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  Database,
  Filter,
  Scale,
} from "lucide-react";
import { dimensionMeta } from "@/data/mockDimensions";
import PageHeader from "@/components/layout/PageHeader";

interface SectionCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-slate-950 p-2 text-white">{icon}</div>
        <h2 className="text-base font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function FormulaBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-6 text-slate-700">
      {children}
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader
        title="Methodology"
        subtitle="How AI Maturity is calculated from normalized indicators, pillar aggregation and data coverage."
      />

      <div className="space-y-5">
        <SectionCard title="Purpose of AI Maturity" icon={<BookOpen size={18} />}>
          <p className="text-sm leading-relaxed text-slate-600">
            <b>AI Maturity</b> is a composite view of a
            country&apos;s capacity to develop, adopt and govern artificial
            intelligence. The current version is built from indicators grouped
            into three pillars: Policy and governance, Infrastructure, and
            Digital skills.
          </p>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The dashboard does not treat the maturity assessment as an absolute truth. It is a
            structured comparison tool. Countries with limited evidence are
            penalized through a coverage adjustment so that sparse data does not
            produce an artificially strong classification.
          </p>
        </SectionCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-slate-950 p-2 text-white">
              <Database size={18} />
            </div>
            <h2 className="text-base font-black text-slate-900">
              Three-pillar structure
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {dimensionMeta.map((pillar) => (
              <div
                key={pillar.key}
                className="rounded-xl border border-slate-100 p-4 transition-colors hover:border-slate-200"
              >
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: pillar.color }}
                  />
                  <h3 className="text-sm font-black text-slate-800">
                    {pillar.label}
                  </h3>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    Equal weight
                  </span>
                </div>

                <p className="mb-2 text-xs leading-5 text-slate-500">
                  {pillar.description}
                </p>

                <ul className="space-y-0.5">
                  {pillar.indicators.map((indicator) => (
                    <li
                      key={indicator}
                      className="flex items-start gap-1.5 text-xs text-slate-600"
                    >
                      <span className="mt-0.5 text-slate-300">•</span>
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SectionCard
            title="Indicator normalization"
            icon={<Scale size={18} />}
          >
            <p className="text-sm leading-relaxed text-slate-600">
              Each indicator is converted into an internal normalized grade
              before aggregation. The dashboard only exposes qualitative
              readiness bands, not the underlying internal scores.
            </p>

            <FormulaBox>
              Internal indicator grade = normalized and direction-adjusted
              indicator value
            </FormulaBox>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              The direction of each indicator must be corrected before
              ingestion. If a raw indicator represents a burden, cost or risk,
              its normalized grade must be inverted so that a stronger grade
              always represents better readiness.
            </p>
          </SectionCard>

          <SectionCard title="Latest-year selection" icon={<Filter size={18} />}>
            <p className="text-sm leading-relaxed text-slate-600">
              If an indicator contains several years for the same country, the
              generator keeps only the latest available year. This prevents old
              observations from being mixed with more recent ones inside the
              same indicator.
            </p>

            <FormulaBox>
              country-indicator value = latest available observation for that
              country and indicator
            </FormulaBox>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Countries can have different latest years depending on source
              availability. This is acceptable for the current version, but it
              should be considered when interpreting results.
            </p>
          </SectionCard>
        </div>

        <SectionCard
          title="Pillar scoring and coverage adjustment"
          icon={<BarChart2 size={18} />}
        >
          <p className="text-sm leading-relaxed text-slate-600">
            Each pillar first calculates an internal raw score from the
            available indicator grades for that country. The pillar is then
            adjusted by its data coverage. This prevents a country with very
            limited evidence from receiving the same confidence as a country
            with broader evidence.
          </p>

          <FormulaBox>
            raw pillar score = average of available indicator grades
            <br />
            pillar coverage = available indicators / total indicators in pillar
            <br />
            final pillar score = raw pillar score × pillar coverage
          </FormulaBox>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The final pillar score is used internally to assign the qualitative
            pillar band shown in the dashboard.
          </p>
        </SectionCard>

        <SectionCard title="Overall country score" icon={<BarChart2 size={18} />}>
          <p className="text-sm leading-relaxed text-slate-600">
            The three pillars are aggregated using equal weights. The resulting
            country score is then adjusted by the country&apos;s average data
            coverage. This means the final classification combines both
            performance and evidence availability.
          </p>

          <FormulaBox>
            raw country score = weighted average of pillar scores
            <br />
            data coverage = average pillar coverage
            <br />
            final country score = raw country score × data coverage
          </FormulaBox>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The numerical result remains internal. Users see the qualitative
            readiness classification and the country&apos;s data coverage.
          </p>
        </SectionCard>

        <SectionCard title="Readiness bands" icon={<Scale size={18} />}>
          <p className="text-sm leading-relaxed text-slate-600">
            Countries, pillars and indicators are assigned to one of four
            qualitative readiness bands. The internal thresholds are used
            consistently across the dashboard but are not displayed in the user
            interface.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {[
              {
                label: "Mature",
                color: "#b9108f",
              },
              {
                label: "Developing",
                color: "#06b812",
              },
              {
                label: "Adopting",
                color: "#f59e0b",
              },
              {
                label: "Early adopting",
                color: "#ef4444",
              },
            ].map((band) => (
              <div
                key={band.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: band.color }}
                  />
                  <p className="text-sm font-black text-slate-900">
                    {band.label}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  Qualitative readiness band
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Limitations and caveats"
          icon={<AlertCircle size={18} />}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              {
                title: "Coverage adjustment is intentionally strict",
                desc: "Countries with limited evidence are penalized. This improves methodological honesty but can push countries down if sources are sparse.",
              },
              {
                title: "Indicator grades must be audited",
                desc: "The dashboard assumes indicator grades are already correctly normalized and direction-adjusted. A bad grade column will directly corrupt the maturity assessment.",
              },
              {
                title: "Latest-year mismatch",
                desc: "Different indicators may have different latest available years. The current version selects the latest observation per indicator-country pair.",
              },
              {
                title: "Equal weights are transparent, not perfect",
                desc: "Each pillar currently receives equal weight. This is easy to explain but should be tested against alternative weighting strategies later.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-amber-100 bg-amber-50 p-3"
              >
                <p className="mb-1 text-xs font-semibold text-amber-800">
                  {item.title}
                </p>
                <p className="text-xs leading-5 text-amber-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
