import { Routes, Route } from "react-router";
import { HomePage } from "./pages/HomePage";
import { ResearchPage } from "./pages/ResearchPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/research" element={<ResearchPage />} />
    </Routes>
  );
}
