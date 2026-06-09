import { FileText, ExternalLink, Download, Clock } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const reports = [
  {
    id: 1,
    title: "Global AI Readiness Report 2024",
    description:
      "Comprehensive analysis of AI development capacity across 30+ nations, covering all five readiness enablers with country profiles and regional spotlights.",
    year: 2024,
    pages: 148,
    type: "Annual Report",
    status: "available",
    color: "blue",
  },
  {
    id: 2,
    title: "Regional AI Development Gap Analysis",
    description:
      "Detailed examination of intra-regional disparities in AI readiness, with focus on technology transfer, policy harmonization, and cooperative frameworks.",
    year: 2024,
    pages: 64,
    type: "Thematic Report",
    status: "available",
    color: "emerald",
  },
  {
    id: 3,
    title: "Frontier AI Nations: Leaders & Challengers",
    description:
      "In-depth profiling of the top 10 AI-ready nations, analyzing competitive positioning, innovation ecosystems, and strategic priorities through 2030.",
    year: 2024,
    pages: 82,
    type: "Special Report",
    status: "available",
    color: "purple",
  },
  {
    id: 4,
    title: "AI Infrastructure Gap Report",
    description:
      "Assessment of compute infrastructure disparities globally, including data center deployment, cloud availability, and energy capacity constraints for AI.",
    year: 2024,
    pages: 55,
    type: "Technical Report",
    status: "coming-soon",
    color: "orange",
  },
  {
    id: 5,
    title: "AI Talent & Education Landscape 2024",
    description:
      "Global mapping of AI talent supply, educational pipelines, research output, and emerging talent hubs across different income groups.",
    year: 2024,
    pages: 71,
    type: "Thematic Report",
    status: "coming-soon",
    color: "rose",
  },
  {
    id: 6,
    title: "AI Policy & Governance Benchmark",
    description:
      "Comparative analysis of national AI strategies, regulatory frameworks, safety governance, and public sector AI adoption across 30 countries.",
    year: 2024,
    pages: 90,
    type: "Policy Report",
    status: "coming-soon",
    color: "indigo",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200", icon: "text-blue-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", icon: "text-emerald-500" },
  purple: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200", icon: "text-purple-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200", icon: "text-orange-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", icon: "text-rose-500" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", icon: "text-indigo-500" },
};

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Research publications and analytical reports from the AI Index"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map((report) => {
          const colors = colorMap[report.color];
          const isAvailable = report.status === "available";

          return (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${colors.bg} ${colors.icon}`}>
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${colors.bg} ${colors.text}`}
                  >
                    {report.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {report.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed flex-1">
                {report.description}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{report.year}</span>
                <span>{report.pages} pages</span>
              </div>

              {isAvailable ? (
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <ExternalLink size={12} /> View Report
                  </button>
                  <button className="flex items-center justify-center gap-1.5 text-xs font-medium border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <Download size={12} /> PDF
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  <Clock size={13} />
                  Coming Soon — Q1 2025
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
