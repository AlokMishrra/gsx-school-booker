import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using ZeroSchool (the "Service"), operated by ZeroMonk Pvt Ltd, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                ZeroSchool is a school session booking platform that connects colleges with schools across India. The Service allows colleges to browse schools, book physical sessions, and schedule career fairs at participating schools.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your contact information is up to date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Booking Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When making bookings through our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Each college can book one physical session per school</li>
                <li>Each college can book one career fair per school</li>
                <li>Bookings are subject to availability</li>
                <li>You must provide accurate information for all bookings</li>
                <li>Cancellation policies apply as per our Refund Policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Payment for bookings must be made through our approved payment methods. All fees are non-refundable except as required by law or as specified in our Refund Policy. We reserve the right to change our fees at any time with prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You may not use the Service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations</li>
                <li>To infringe upon or violate our intellectual property rights</li>
                <li>To harass, abuse, insult, harm, defame, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To interfere with or circumvent security features of the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service and its original content, features, and functionality are owned by ZeroMonk Pvt Ltd and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall ZeroMonk Pvt Ltd, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any material changes by posting the new Terms on this page with an updated "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="mt-3 space-y-1 text-muted-foreground">
                <p><strong>ZeroMonk Pvt Ltd</strong></p>
                <p>Email: legal@zeroschool.com</p>
                <p>Phone: +91-XXXX-XXXXXX</p>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
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

export default TermsOfService;
