import { Link, useNavigate } from "react-router-dom";
import { Zap, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-4">
          <img src="/zeroschool-logo.svg" alt="ZeroSchool" className="h-8 w-8" />
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight">ZERO'S SCHOOL</span>
            <span className="text-xs text-muted-foreground">School Session Booking Platform</span>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/career-fair" className="text-sm font-medium hover:text-primary transition-colors">
            Browse Schools
          </Link>
          
          {user ? (
            // Logged in - show Book Now and Logout
            <>
              <Link 
                to="/career-fair" 
                className="relative group px-6 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
              >
                {/* Animated lightning border */}
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></span>
                <span className="absolute inset-[2px] rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></span>
                
                {/* Content */}
                <span className="relative flex items-center gap-2">
                  <Zap className="h-4 w-4 animate-pulse" />
                  Book Now
                </span>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            // Not logged in - show Login and Register
            <>
              <Button 
                variant="outline" 
                onClick={() => navigate('/login')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:scale-105 transition-all flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Register
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
