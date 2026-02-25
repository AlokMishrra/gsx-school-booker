import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>
        </div>

        <Card>
          <CardContent className="p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Overview</h2>
              <p className="text-muted-foreground leading-relaxed">
                At ZeroSchool, operated by ZeroMonk Pvt Ltd, we strive to provide the best booking experience. This Refund Policy outlines the circumstances under which refunds may be issued for bookings made through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Cancellation Period</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Refund eligibility depends on when you cancel your booking:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>More than 7 days before session:</strong> 100% refund</li>
                <li><strong>4-7 days before session:</strong> 75% refund</li>
                <li><strong>2-3 days before session:</strong> 50% refund</li>
                <li><strong>Less than 2 days before session:</strong> No refund</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Refund Process</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                To request a refund:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Contact our support team at support@zeroschool.com</li>
                <li>Provide your booking reference number</li>
                <li>State the reason for cancellation</li>
                <li>Refunds will be processed within 7-10 business days</li>
                <li>Refunds will be credited to the original payment method</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">4. Non-Refundable Situations</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Refunds will not be issued in the following cases:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>No-show without prior cancellation</li>
                <li>Cancellations made less than 48 hours before the session</li>
                <li>Violation of our Terms of Service</li>
                <li>Bookings made with fraudulent information</li>
                <li>After the session has been completed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">5. School-Initiated Cancellations</h2>
              <p className="text-muted-foreground leading-relaxed">
                If a school cancels a session for any reason, you will receive a 100% refund or the option to reschedule to another available slot at no additional cost.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">6. Force Majeure</h2>
              <p className="text-muted-foreground leading-relaxed">
                In case of unforeseen circumstances such as natural disasters, pandemics, or government restrictions that prevent the session from taking place, we will work with you to either reschedule or provide a full refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Rescheduling</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may reschedule your booking once without penalty if done at least 7 days before the scheduled session. Additional rescheduling requests may incur a fee.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Processing Fees</h2>
              <p className="text-muted-foreground leading-relaxed">
                Payment processing fees (typically 2-3% of the booking amount) are non-refundable and will be deducted from any refund amount.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Disputes</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any concerns about a refund decision, please contact our support team. We will review your case and respond within 3-5 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                For refund requests or questions about this policy, please contact:
              </p>
              <div className="mt-3 space-y-1 text-muted-foreground">
                <p><strong>ZeroMonk Pvt Ltd</strong></p>
                <p>Email: refunds@zeroschool.com</p>
                <p>Phone: +91-XXXX-XXXXXX</p>
                <p>Support Hours: Monday-Friday, 9:00 AM - 6:00 PM IST</p>
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

export default RefundPolicy;
