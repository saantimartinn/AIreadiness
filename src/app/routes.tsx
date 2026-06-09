import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const OverviewPage = lazy(() => import("@/pages/OverviewPage"));
const RankingsPage = lazy(() => import("@/pages/RankingsPage"));
const ComparePage = lazy(() => import("@/pages/ComparePage"));
const MethodologyPage = lazy(() => import("@/pages/MethodologyPage"));
const MapPage = lazy(() => import("@/pages/MapPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));

function LoadingFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}

function CountryToExtendedProfileRedirect() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const safeCountryCode = countryCode?.trim().toUpperCase() ?? "";

  return <Navigate to={`/map?country=${encodeURIComponent(safeCountryCode)}`} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/rankings" element={<RankingsPage />} />
          <Route path="/country/:countryCode" element={<CountryToExtendedProfileRedirect />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/reports" element={<Navigate to="/" replace />} />
          <Route path="/downloads" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}