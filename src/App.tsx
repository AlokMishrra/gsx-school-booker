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
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchools from "./pages/admin/AdminSchools";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminReports from "./pages/admin/AdminReports";
import AdminBulk from "./pages/admin/AdminBulk";
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
              <Route path="/schools" element={<Schools />} />
              <Route path="/schools/:id" element={<SchoolDetail />} />
              
              {/* Protected Routes (Colleges) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/schools" element={<AdminSchools />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/bulk" element={<AdminBulk />} />
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
