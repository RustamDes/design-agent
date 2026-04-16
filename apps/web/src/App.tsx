import { Routes, Route } from "react-router";
import ProjectsPage from "./pages/ProjectsPage";
import { NewProjectPage } from "./pages/NewProjectPage";
import ProjectPage from "./pages/ProjectPage";
import StagePage from "./pages/StagePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectsPage />} />
      <Route path="/new-project" element={<NewProjectPage />} />
      <Route path="/project/:id" element={<ProjectPage />} />
      <Route path="/project/:id/:stage" element={<StagePage />} />
    </Routes>
  );
}
