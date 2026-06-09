import { useState } from "react";
import type { DashboardFilters, AIDimension, Region } from "@/types";

const defaultFilters: DashboardFilters = {
  year: 2024,
  dimension: "Overall Score",
  region: "All Regions",
};

export function useDashboardFilters() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);

  function setYear(year: number) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      year,
    }));
  }

  function setDimension(dimension: AIDimension | "Overall Score") {
    setFilters((currentFilters) => ({
      ...currentFilters,
      dimension,
    }));
  }

  function setRegion(region: Region | "All Regions") {
    setFilters((currentFilters) => ({
      ...currentFilters,
      region,
    }));
  }

  function resetFilters() {
    setFilters(defaultFilters);
  }

  return {
    filters,
    setYear,
    setDimension,
    setRegion,
    resetFilters,
  };
}