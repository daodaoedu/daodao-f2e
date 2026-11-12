import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { PublicSurveyPage } from "@/pages/PublicSurveyPage";
import { SurveyManagementPage } from "@/pages/SurveyManagementPage";

export function App() {
  return (
    <Routes>
      <Route path="/surveys" element={<AppShell />}>
        <Route index element={<SurveyManagementPage />} />
      </Route>
      <Route path="/survey/r/:shareId" element={<PublicSurveyPage />} />
      <Route path="*" element={<Navigate to="/surveys" replace />} />
    </Routes>
  );
}
