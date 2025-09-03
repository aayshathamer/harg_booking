import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { DatabaseManager } from "@/lib/initDatabase";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Deals from "./pages/Deals";
import Events from "./pages/Events";
import Profile from "./pages/Profile";

import Notifications from "./pages/Notifications";
import BookingHistory from "./pages/BookingHistory";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminServices from "./pages/admin/AdminServices";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminDeals from "./pages/admin/AdminDeals";
import AdminSettings from "./pages/admin/AdminSettings";
import ServiceForm from "./components/admin/ServiceForm";
import DealForm from "./components/admin/DealForm";
import UserForm from "./components/admin/UserForm";
import UserView from "./components/admin/UserView";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize database when app starts
  useEffect(() => {
    DatabaseManager.initialize().catch(console.error);
    
    // Cleanup on unmount
    return () => {
      DatabaseManager.cleanup();
    };
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <UserProvider>
          <AdminProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Services />} />
                <Route path="/deals" element={<Deals />} />
                <Route path="/events" element={<Events />} />

                {/* User Profile Routes */}
                <Route path="/profile" element={<Profile />} />
        
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/booking-history" element={<BookingHistory />} />

                {/* Payment Routes */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="services/new" element={<ServiceForm />} />
                  <Route path="services/edit/:id" element={<ServiceForm />} />
                  <Route path="deals" element={<AdminDeals />} />
                  <Route path="deals/new" element={<DealForm />} />
                  <Route path="deals/edit/:id" element={<DealForm />} />

                  <Route path="users" element={<AdminUsers />} />
                  <Route path="users/new" element={<UserForm mode="create" />} />
                  <Route path="users/edit/:id" element={<UserForm mode="edit" />} />
                  <Route path="users/view/:id" element={<UserView />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AdminProvider>
        </UserProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
