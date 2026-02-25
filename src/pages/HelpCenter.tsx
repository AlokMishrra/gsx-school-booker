import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Search, BookOpen, Calendar, CreditCard, Users, HelpCircle } from "lucide-react";
import { useState } from "react";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn the basics of using ZeroSchool",
      articles: [
        "How to create an account",
        "Browsing schools",
        "Understanding school tiers",
        "Platform overview"
      ]
    },
    {
      icon: Calendar,
      title: "Booking Sessions",
      description: "Everything about making bookings",
      articles: [
        "How to book a physical session",
        "How to book a career fair",
        "Booking limitations and rules",
        "Confirming your booking"
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Refunds",
      description: "Payment methods and refund policies",
      articles: [
        "Accepted payment methods",
        "How to request a refund",
        "Refund processing time",
        "Payment security"
      ]
    },
    {
      icon: Users,
      title: "Account Management",
      description: "Managing your account settings",
      articles: [
        "Updating profile information",
        "Changing password",
        "Managing notifications",
        "Deleting your account"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-12 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Find answers to your questions
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                    <ul className="space-y-2">
                      {category.articles.map((article, idx) => (
                        <li key={idx}>
                          <a href="#" className="text-primary hover:underline text-sm">
                            {article}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Popular Articles */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Popular Articles</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b">
                <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">
                    <a href="#" className="hover:text-primary">How do I book multiple sessions?</a>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn about booking multiple sessions across different schools and the one-per-type rule.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b">
                <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">
                    <a href="#" className="hover:text-primary">What is the cancellation policy?</a>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understand our cancellation policy and refund timelines for different scenarios.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 pb-4 border-b">
                <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">
                    <a href="#" className="hover:text-primary">How do school tiers work?</a>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Learn about our school tier system and what each tier represents.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">
                    <a href="#" className="hover:text-primary">Can I reschedule my booking?</a>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find out how to reschedule your bookings and any associated fees.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Still Need Help */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-none">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us">
                <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">
                  Contact Support
                </button>
              </Link>
              <Link to="/faqs">
                <button className="px-6 py-3 border border-black rounded-lg hover:bg-black/5 transition-colors">
                  View FAQs
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 ZeroSchool by ZeroMonk Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HelpCenter;
