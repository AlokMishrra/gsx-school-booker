import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Calendar, Users, ArrowRight, School, CheckCircle, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTracking } from "@/hooks/useTracking";
import { Header } from "@/components/layout/Header";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { trackClick } = useTracking();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const stats = [
    { label: "Schools", value: "275+", icon: School },
    { label: "Cities", value: "50+", icon: Building2 },
    { label: "Bookings", value: "10K+", icon: Calendar },
    { label: "Colleges", value: "500+", icon: Users },
  ];

  const features = [
    {
      title: "Discover Schools",
      description: "Browse through 275+ premium schools across India",
      icon: School,
      delay: "0s"
    },
    {
      title: "Select Sessions",
      description: "Choose physical sessions or career fairs that fit your schedule",
      icon: Calendar,
      delay: "0.2s"
    },
    {
      title: "Book Instantly",
      description: "Complete your booking in minutes without any hassle",
      icon: CheckCircle,
      delay: "0.4s"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Animation */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                             linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
          {/* Radial gradient overlay for fade effect */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/50 to-white"></div>
        </div>
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Content */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm animate-fade-in">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 500+ Colleges</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              Book School Sessions
              <br />
              <span className="text-muted-foreground">Made Simple</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground animate-slide-up" style={{animationDelay: '0.2s'}}>
              Connect with 275+ schools across India. Book physical sessions and career fairs in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Button
                size="lg"
                className="zs-gradient text-white px-8"
                onClick={() => {
                  trackClick('hero-cta', 'Start Booking');
                  navigate("/career-fair");
                }}
              >
                Start Booking
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Story Format */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to book your session</p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center animate-slide-up"
                style={{animationDelay: feature.delay}}
              >
                <div className="relative mb-6 inline-block">
                  {/* 3D Card Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl transform translate-x-2 translate-y-2"></div>
                  <div className="relative bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-black to-gray-700 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-background py-16">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="skeleton h-12 w-12 mx-auto rounded-full" />
                    <div className="skeleton h-8 w-20 mx-auto" />
                    <div className="skeleton h-4 w-16 mx-auto" />
                  </div>
                ) : (
                  <>
                    <stat.icon className="mx-auto mb-2 h-8 w-8" />
                    <div className="text-4xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools Showcase - Auto-scrolling */}
      <section className="py-20 overflow-hidden">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              275+ Schools Across India
            </h2>
            <p className="text-muted-foreground">
              Premium schools waiting for your visit
            </p>
          </div>

          {isLoading ? (
            <div className="flex gap-6 overflow-hidden">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="flex-shrink-0 w-80 overflow-hidden">
                  <div className="skeleton h-48 w-full" />
                  <CardContent className="p-4 space-y-2">
                    <div className="skeleton h-6 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="flex gap-6 animate-scroll">
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex gap-6 flex-shrink-0">
                    {[
                      { name: "Delhi Public School", location: "Delhi", tier: 1, students: 2500, image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop&q=80" },
                      { name: "Ryan International", location: "Mumbai", tier: 1, students: 3000, image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop&q=80" },
                      { name: "DAV Public School", location: "Bangalore", tier: 2, students: 1800, image: "https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop&q=80" },
                      { name: "Kendriya Vidyalaya", location: "Chennai", tier: 2, students: 1500, image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=400&h=300&fit=crop&q=80" },
                      { name: "St. Xavier's School", location: "Kolkata", tier: 1, students: 2200, image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&q=80" },
                      { name: "Modern School", location: "Pune", tier: 2, students: 2000, image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop&q=80" },
                      { name: "Amity International", location: "Noida", tier: 1, students: 2800, image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop&q=80" },
                      { name: "The Heritage School", location: "Gurgaon", tier: 1, students: 3200, image: "https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=400&h=300&fit=crop&q=80" },
                      { name: "Sanskriti School", location: "Delhi", tier: 1, students: 2100, image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop&q=80" },
                      { name: "Bombay Scottish", location: "Mumbai", tier: 1, students: 2400, image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop&q=80" },
                    ].map((school, index) => (
                      <Card
                        key={`${setIndex}-${index}`}
                        className="flex-shrink-0 w-80 overflow-hidden card-hover cursor-pointer group"
                        onClick={() => navigate("/career-fair")}
                      >
                        <div className="relative h-48 overflow-hidden bg-gray-100">
                          {/* Real School Image */}
                          <img 
                            src={school.image} 
                            alt={`${school.name} - ${school.location}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to gradient if image fails to load
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                              }
                            }}
                          />
                          
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                          
                          {/* Tier Badge */}
                          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg border border-white/20">
                            Tier {school.tier}
                          </div>
                          
                          {/* Student Count */}
                          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-gray-900">{school.students}</span>
                          </div>
                        </div>
                        <CardContent className="p-4 bg-white">
                          <h3 className="font-semibold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">{school.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {school.location}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/career-fair")}
            >
              View All Schools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 zs-gradient opacity-95" />
            <CardContent className="relative z-10 p-12 text-center text-white">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ready to Book Your Session?
              </h2>
              <p className="mb-8 text-lg opacity-90">
                Join hundreds of colleges already using ZeroSchool
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/career-fair")}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/zeroschool-logo.svg" alt="ZeroSchool" className="h-8 w-8" />
                <div className="flex flex-col">
                  <span className="font-bold">ZERO'S SCHOOL</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Your trusted platform for booking school facilities and equipment.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Powered by ZeroMonk Pvt Ltd
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/career-fair" className="text-muted-foreground hover:text-foreground">
                    Browse Schools
                  </Link>
                </li>
                <li>
                  <Link to="/career-fair" className="text-muted-foreground hover:text-foreground">
                    Register Your College
                  </Link>
                </li>
                <li>
                  <Link to="/ZSINA" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/contact-us" className="text-muted-foreground hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/help-center" className="text-muted-foreground hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/faqs" className="text-muted-foreground hover:text-foreground">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="text-muted-foreground hover:text-foreground">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 ZeroSchool by ZeroMonk Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
