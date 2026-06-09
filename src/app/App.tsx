import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import OverviewPage from "@/pages/OverviewPage";
import RankingsPage from "@/pages/RankingsPage";
import MapPage from "@/pages/MapPage";
import ComparePage from "@/pages/ComparePage";
import ChatPage from "@/pages/ChatPage";
import MethodologyPage from "@/pages/MethodologyPage";

function CountryToExtendedProfileRedirect() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const safeCountryCode = countryCode?.trim().toUpperCase() ?? "";

  return <Navigate to={`/map?country=${encodeURIComponent(safeCountryCode)}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="methodology" element={<MethodologyPage />} />

          <Route path="country/:countryCode" element={<CountryToExtendedProfileRedirect />} />
          <Route path="reports" element={<Navigate to="/" replace />} />
          <Route path="downloads" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}