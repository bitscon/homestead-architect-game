import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PropertyAssessment from "./pages/PropertyAssessment";
import SeasonalCalendar from "./pages/SeasonalCalendar";
import HealthHub from "./pages/HealthHub";
import InventoryManagement from "./pages/InventoryManagement";
import HomesteadBalance from "./pages/HomesteadBalance";
import HomesteadJournal from "./pages/HomesteadJournal";
import HomesteadGoals from "./pages/HomesteadGoals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthContextProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route 
              path="/property-assessment" 
              element={
                <ProtectedRoute>
                  <PropertyAssessment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seasonal-calendar" 
              element={
                <ProtectedRoute>
                  <SeasonalCalendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health-hub" 
              element={
                <ProtectedRoute>
                  <HealthHub />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <InventoryManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/homestead-balance" 
              element={
                <ProtectedRoute>
                  <HomesteadBalance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/homestead-journal" 
              element={
                <ProtectedRoute>
                  <HomesteadJournal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/homestead-goals" 
              element={
                <ProtectedRoute>
                  <HomesteadGoals />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthContextProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
