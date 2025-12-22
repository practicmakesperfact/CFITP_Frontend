
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageSquare, Home, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home", icon: <Home size={18} /> },
    { path: "/login", label: "Login", icon: <LogIn size={18} /> },
    
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">CFITP</span>
              <span className="text-xs text-teal-600 font-medium block -mt-1">
                Client Feedback Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  location.pathname === link.path
                    ? "bg-teal-50 text-teal-600 font-medium"
                    : "text-gray-700 hover:text-teal-600 hover:bg-teal-50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            
            <Link
              to="/register"
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-teal-500/30"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    location.pathname === link.path
                      ? "bg-teal-50 text-teal-600 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white text-center py-3 rounded-lg font-medium"
                >
                   Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}