import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Programs from "./pages/Programs";
import CalendarPage from "./pages/CalendarPage";
import OccupancyMap from "./pages/OccupancyMap";
import UsersPage from "./pages/UsersPage";
import Reservations from "./pages/Reservations";
import Sessions from "./pages/Sessions";
import Schedule from "./pages/Schedule";
import PeoplePage from "./pages/PeoplePage";
import SpacesPage from "./pages/SpacesPage";
import ResourcesPage from "./pages/ResourcesPage";
import NotFound from "./pages/NotFound";
import NewProgramPage from "./pages/NewProgramPage";
import NewTurmaPage from "./pages/NewTurmaPage";
import TurmaCPanelPage from "./pages/TurmaCPanelPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/occupancy" element={<OccupancyMap />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/schedule" element={<Schedule />} />
          {/* Catalog pages */}
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/spaces" element={<SpacesPage />} />
          <Route path="/resources-catalog" element={<ResourcesPage />} />
          {/* Legacy routes */}
          <Route path="/professors" element={<PeoplePage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          {/* Admin */}
          <Route path="/users" element={<UsersPage />} />
          {/* Program & Turma forms */}
          <Route path="/programs/new" element={<NewProgramPage />} />
          <Route path="/programs/edit" element={<NewProgramPage />} />
          <Route path="/programs/turma/new" element={<NewTurmaPage />} />
          <Route path="/programs/turma/edit" element={<NewTurmaPage />} />
          <Route path="/programs/turma/cpanel" element={<TurmaCPanelPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
