import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "What is ZeroSchool?",
          a: "ZeroSchool is a school session booking platform operated by ZeroMonk Pvt Ltd that connects colleges with 275+ schools across India. We facilitate physical sessions and career fair bookings at participating schools."
        },
        {
          q: "Who can use ZeroSchool?",
          a: "ZeroSchool is designed for colleges and educational institutions looking to conduct physical sessions or career fairs at schools across India."
        },
        {
          q: "Is there a fee to use the platform?",
          a: "Creating an account and browsing schools is free. Fees apply only when you make bookings, and vary based on the school and session type."
        }
      ]
    },
    {
      category: "Bookings",
      questions: [
        {
          q: "How many sessions can I book?",
          a: "Each college can book one physical session and one career fair per school. This ensures fair access for all colleges."
        },
        {
          q: "Can I book sessions at multiple schools?",
          a: "Yes! You can book sessions at as many schools as you'd like, with the limit of one physical session and one career fair per school."
        },
        {
          q: "How do I know if a slot is available?",
          a: "Available slots are shown in green on the booking calendar. Red slots are already booked and unavailable."
        },
        {
          q: "Can I change my booking after confirmation?",
          a: "Yes, you can reschedule once without penalty if done at least 7 days before the scheduled session. Additional changes may incur fees."
        }
      ]
    },
    {
      category: "Payments & Refunds",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept credit cards, debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment gateway."
        },
        {
          q: "When will I be charged?",
          a: "Payment is processed immediately upon booking confirmation. You'll receive a confirmation email with payment details."
        },
        {
          q: "What is your refund policy?",
          a: "Refunds depend on cancellation timing: 100% refund if cancelled 7+ days before, 75% for 4-7 days, 50% for 2-3 days, and no refund for less than 2 days notice."
        },
        {
          q: "How long do refunds take?",
          a: "Approved refunds are processed within 7-10 business days and credited to your original payment method."
        }
      ]
    },
    {
      category: "School Information",
      questions: [
        {
          q: "What do school tiers mean?",
          a: "Tier 1 schools are premium institutions with excellent infrastructure and high fees. Tier 2 schools offer quality facilities with moderate fees. Tier 3 schools provide standard facilities with affordable fees."
        },
        {
          q: "How can I filter schools?",
          a: "You can filter schools by location (city) and tier on the booking page. This helps you find schools that match your preferences."
        },
        {
          q: "Can I see school details before booking?",
          a: "Yes! Hover over any school name to see details including student strength, address, email, fees, and tier information."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "How do I create an account?",
          a: "Currently, you can book sessions without creating an account. Simply provide your details when making a booking."
        },
        {
          q: "Is my information secure?",
          a: "Yes, we use industry-standard encryption and security measures to protect your personal and payment information. Read our Privacy Policy for details."
        },
        {
          q: "Can I update my booking details?",
          a: "Yes, contact our support team at support@zeroschool.com with your booking reference to update details."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "What if I encounter a technical issue?",
          a: "Contact our support team immediately at support@zeroschool.com or call +91-XXXX-XXXXXX during business hours."
        },
        {
          q: "Which browsers are supported?",
          a: "ZeroSchool works best on the latest versions of Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated."
        },
        {
          q: "Can I use ZeroSchool on mobile?",
          a: "Yes! Our platform is fully responsive and works on all mobile devices and tablets."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-12 max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground text-lg">
            Find quick answers to common questions
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, catIndex) => (
            <div key={catIndex}>
              <h2 className="text-2xl font-semibold mb-4">{category.category}</h2>
              <div className="space-y-3">
                {category.questions.map((faq, qIndex) => {
                  const globalIndex = catIndex * 100 + qIndex;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <Card key={qIndex} className="overflow-hidden">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-semibold pr-4">{faq.q}</span>
                        <ChevronDown 
                          className={`h-5 w-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <CardContent className="px-4 pb-4 pt-0">
                          <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <Card className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Please reach out to our support team.
            </p>
            <Link to="/contact-us">
              <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-black/90 transition-colors">
                Contact Support
              </button>
            </Link>
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

export default FAQs;
