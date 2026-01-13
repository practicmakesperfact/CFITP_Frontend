import { Link, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";

export default function HomeFooter() {
  const navigate = useNavigate();

  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/login", label: "Login" },
    { path: "/register", label: "Register" },
  ];

  const productLinks = [
    {
      path: "/app/issues",
      label: "Issue Tracking",
      icon: <FileText size={16} />,
    },
    {
      path: "/app/feedback",
      label: "Feedback System",
      icon: <MessageSquare size={16} />,
    },
    { path: "/app/reports", label: "Analytics", icon: <BarChart3 size={16} /> },
  ];

  const supportLinks = [
    { path: "/help", label: "Help Center", icon: <HelpCircle size={16} /> },
    { path: "/privacy", label: "Privacy Policy", icon: <Shield size={16} /> },
    { path: "/terms", label: "Terms of Service", icon: <FileText size={16} /> },
  ];

  const socialLinks = [
    { icon: <Facebook size={20} />, label: "Facebook", url: "#" },
    { icon: <Twitter size={20} />, label: "Twitter", url: "#" },
    { icon: <Linkedin size={20} />, label: "LinkedIn", url: "#" },
    { icon: <Instagram size={20} />, label: "Instagram", url: "#" },
  ];

  // Handle link clicks to prevent scrolling to top
  const handleLinkClick = (e, path) => {
    e.preventDefault();

    // Get current scroll position
    const scrollY = window.scrollY;

    // Navigate to the new page
    navigate(path);

    // After navigation, restore scroll position
    // This happens after a small delay to let React Router handle the navigation
    setTimeout(() => {
      window.scrollTo(0, scrollY);
    }, 100);
  };

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">CFITP</h3>
                <p className="text-sm text-teal-400">
                  Client Feedback & Issue Tracking Portal
                </p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering businesses with powerful customer feedback and issue
              tracking solutions.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-teal-600 hover:text-white transition-colors"
                  aria-label={social.label}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(social.url, "_blank");
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 hover:text-teal-400 transition-colors group"
                  >
                    <span className="w-1 h-1 bg-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">
              Platform features
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-3 hover:text-teal-400 transition-colors group"
                  >
                    <div className="text-gray-500 group-hover:text-teal-400 transition-colors">
                      {link.icon}
                    </div>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Support</h4>
            <ul className="space-y-3 mb-8">
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.path}
                    onClick={(e) => handleLinkClick(e, link.path)}
                    className="flex items-center gap-3 hover:text-teal-400 transition-colors group cursor-pointer"
                  >
                    <div className="text-gray-500 group-hover:text-teal-400 transition-colors">
                      {link.icon}
                    </div>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-teal-400" size={18} />
                <span>support@aitb.edu.et</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-teal-400" size={18} />
                <span>+251 58 220 0000</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-teal-400" size={18} />
                <span>Bahir Dar, Ethiopia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-gray-400">
                © {new Date().getFullYear()} AITB Issue Tracking System. All
                rights reserved.
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a
                href="/privacy"
                onClick={(e) => handleLinkClick(e, "/privacy")}
                className="hover:text-teal-400 transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                onClick={(e) => handleLinkClick(e, "/terms")}
                className="hover:text-teal-400 transition-colors cursor-pointer"
              >
                Terms of Service
              </a>
              <div className="flex items-center gap-2 text-gray-500">
                <Globe size={14} />
                <span>English</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
