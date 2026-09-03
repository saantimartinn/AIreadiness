import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bot,
  GitCompare,
  Globe2,
  LayoutDashboard,
  Map,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    to: "/",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    to: "/rankings",
    label: "Classification",
    icon: BarChart3,
  },
  {
    to: "/map",
    label: "Extended Profile",
    icon: Map,
  },
  {
    to: "/compare",
    label: "Compare",
    icon: GitCompare,
  },
  {
    to: "/chat",
    label: "Data Chat",
    icon: Bot,
  },
  {
    to: "/methodology",
    label: "Methodology",
    icon: Globe2,
  },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              AI Maturity
            </p>
            <h1 className="text-lg font-black text-slate-950">Dashboard</h1>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="text-xs leading-5 text-slate-400">
            Excel-based AI maturity classification across three pillars.
          </p>
        </div>
      </aside>
    </>
  );
}
