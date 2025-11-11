import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/Sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import PropertyAssessment from "./pages/PropertyAssessment";
import SeasonalCalendar from "./pages/SeasonalCalendar";
import HealthHub from "./pages/HealthHub";
import InventoryManagement from "./pages/InventoryManagement";
import HomesteadBalance from "./pages/HomesteadBalance";
import HomesteadJournal from "./pages/HomesteadJournal";
import HomesteadGoals from "./pages/HomesteadGoals";
import CropPlanner from "./pages/CropPlanner";
import Infrastructure from "./pages/Infrastructure";
import BreedingTracker from "./pages/BreedingTracker";
import StrategicPlanningHub from "./pages/StrategicPlanningHub";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout wrapper for protected routes with sidebar
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b bg-card">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-lg font-semibold text-foreground">Homestead Architect</span>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop (always visible) */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar - mobile (overlay) */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-card shadow-lg z-40 transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 flex-1 overflow-y-auto bg-background pt-14 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

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
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Dashboard />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/property-assessment"
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <PropertyAssessment />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seasonal-calendar" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <SeasonalCalendar />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/health-hub" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <HealthHub />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <InventoryManagement />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/homestead-balance" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <HomesteadBalance />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/journal" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <HomesteadJournal />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <HomesteadGoals />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crop-planner" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <CropPlanner />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/infrastructure" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <Infrastructure />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/breeding-tracker" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <BreedingTracker />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/strategic-planner" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <StrategicPlanningHub />
                  </ProtectedLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user-profile" 
              element={
                <ProtectedRoute>
                  <ProtectedLayout>
                    <UserProfile />
                  </ProtectedLayout>
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
