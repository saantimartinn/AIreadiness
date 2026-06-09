import { Download, FileSpreadsheet, FileJson, Database } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

const downloads = [
  {
    title: "Country Rankings Dataset (CSV)",
    description: "Full country rankings with all scores, enablers, and metadata.",
    icon: FileSpreadsheet,
    size: "42 KB",
    format: "CSV",
  },
  {
    title: "Time Series Data (CSV)",
    description: "Historical scores from 2018–2024 for all countries.",
    icon: FileSpreadsheet,
    size: "128 KB",
    format: "CSV",
  },
  {
    title: "Full Dataset (JSON)",
    description: "Complete dataset including all enablers, strengths, weaknesses, and metadata in JSON format.",
    icon: FileJson,
    size: "95 KB",
    format: "JSON",
  },
  {
    title: "Methodology Documentation",
    description: "Detailed technical documentation of the index methodology, indicators, and data sources.",
    icon: Database,
    size: "2.1 MB",
    format: "PDF",
  },
];

export default function DownloadsPage() {
  return (
    <div>
      <PageHeader
        title="Downloads"
        subtitle="Download raw datasets and documentation for research and analysis"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {downloads.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4"
          >
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
              <item.icon size={22} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{item.description}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs text-slate-400">{item.size}</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {item.format}
                </span>
                <button className="ml-auto flex items-center gap-1.5 text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
