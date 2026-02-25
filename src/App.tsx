import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Schools from "./pages/Schools";
import SchoolDetail from "./pages/SchoolDetail";
import Cart from "./pages/Cart";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchools from "./pages/admin/AdminSchools";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminReports from "./pages/admin/AdminReports";
import AdminBulk from "./pages/admin/AdminBulk";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import CareerFair from "./pages/CareerFair";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import ContactUs from "./pages/ContactUs";
import HelpCenter from "./pages/HelpCenter";
import FAQs from "./pages/FAQs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/career-fair" element={<CareerFair />} />
              <Route path="/schools" element={<CareerFair />} />
              <Route path="/schools/:id" element={<SchoolDetail />} />
              
              {/* Legal & Support Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/faqs" element={<FAQs />} />
              
              {/* Admin Login Route */}
              <Route path="/ZSINA" element={<Login />} />
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/ZSINA/dashboard" element={<AdminDashboard />} />
                <Route path="/ZSINA/schools" element={<AdminSchools />} />
                <Route path="/ZSINA/bookings" element={<AdminBookings />} />
                <Route path="/ZSINA/reports" element={<AdminReports />} />
                <Route path="/ZSINA/bulk" element={<AdminBulk />} />
                <Route path="/ZSINA/analytics" element={<AdminAnalytics />} />
              </Route>
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
