import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">GSX</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Global ServiceX - Your trusted platform for booking school facilities and equipment.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/schools" className="transition-colors hover:text-primary">
                  Browse Schools
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-primary">
                  Register Your College
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-primary">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@gsx.com" className="transition-colors hover:text-primary">
                  Contact Us
                </a>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-primary">
                  Help Center
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-primary">
                  FAQs
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="cursor-pointer transition-colors hover:text-primary">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-primary">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="cursor-pointer transition-colors hover:text-primary">
                  Refund Policy
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GSX - Global ServiceX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
