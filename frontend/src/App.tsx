import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import ClientDashboard from "@/pages/client/Dashboard";
import PlantList from "@/pages/client/PlantList";
import PlantDetail from "@/pages/client/PlantDetail";
import AIChat from "@/pages/client/AIChat";
import Reminders from "@/pages/client/Reminders";
import Booklet from "@/pages/client/Booklet";
import Profile from "@/pages/client/Profile";
import MorePage from "@/pages/client/MorePage";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminPlants from "@/pages/admin/AdminPlants";
import AdminAIChat from "@/pages/admin/AdminAIChat";
import AdminSettings from "@/pages/admin/AdminSettings";
import ManageGarden from "@/pages/admin/ManageGarden";
import GardenBooklet from "@/pages/admin/GardenBooklet";
import LandingPage from "./pages/LandingPage";
import Login from "@/pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/plants" element={<PlantList />} />
                <Route path="/plants/:id" element={<PlantDetail />} />
                <Route path="/chat" element={<AIChat />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/booklet" element={<Booklet />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/plants" element={<AdminPlants />} />
                <Route path="/admin/chat" element={<AdminAIChat />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route
                  path="/admin/gardens/:gardenId"
                  element={<ManageGarden />}
                />
                <Route
                  path="/admin/gardens/:gardenId/booklet"
                  element={<GardenBooklet />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
