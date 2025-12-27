
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Shield,
  BarChart3,
  FileText,
  Building,
  Lightbulb,
  Target,
  Globe,
  Award,
  Cpu,
  Mail,
  Phone,
} from "lucide-react";

export default function HomePage() {
  // Features data - Customized for AITB
  const features = [
    {
      icon: <MessageSquare className="text-[#0F4C81]" size={24} />,
      title: "Real-time Feedback System",
      description:
        "Collect instant feedback from citizens and stakeholders to improve public services.",
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: <FileText className="text-[#2E8B57]" size={24} />,
      title: "Issue Tracking & Management",
      description:
        "Track technology issues from submission to resolution with complete transparency.",
      color: "bg-green-50 border-green-200",
    },
    {
      icon: <Cpu className="text-[#8B4513]" size={24} />,
      title: "Technology Innovation Support",
      description:
        "Support innovative tech projects and monitor their progress effectively.",
      color: "bg-amber-50 border-amber-200",
    },
    {
      icon: <Users className="text-[#6A5ACD]" size={24} />,
      title: "Stakeholder Collaboration",
      description:
        "Facilitate seamless communication between departments, partners, and citizens.",
      color: "bg-purple-50 border-purple-200",
    },
    {
      icon: <BarChart3 className="text-[#008080]" size={24} />,
      title: "Performance Analytics",
      description:
        "Monitor innovation metrics and generate detailed reports for decision-making.",
      color: "bg-teal-50 border-teal-200",
    },
    {
      icon: <Shield className="text-[#8B0000]" size={24} />,
      title: "Secure Government Platform",
      description:
        "Enterprise-grade security with role-based access control for government data.",
      color: "bg-red-50 border-red-200",
    },
  ];

  // Stats data for AITB
  const stats = [
    { number: "24/7", label: "Public Service Support" },
    { number: "99.8%", label: "System Reliability" },
    { number: "50+", label: "Innovation Projects" },
    { number: "2hr", label: "Avg Response Time" },
  ];

  // AITB Core Values
  const values = [
    {
      icon: <Lightbulb className="text-yellow-600" size={20} />,
      title: "Innovation",
      description: "Fostering technological advancement in Amhara region",
    },
    {
      icon: <Target className="text-green-600" size={20} />,
      title: "Excellence",
      description: "Delivering quality technology services to stakeholders",
    },
    {
      icon: <Globe className="text-blue-600" size={20} />,
      title: "Digital Transformation",
      description: "Modernizing government services through technology",
    },
    {
      icon: <Award className="text-purple-600" size={20} />,
      title: "Accountability",
      description: "Transparent tracking and reporting of all initiatives",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Government Theme */}
      <div
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15, 76, 129, 0.85), rgba(15, 76, 129, 0.9)), url('/src/assets/company-background.jpg')",
        }}
      >
        {/* Government pattern overlay - Fixed SVG */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* AITB Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-white/30">
              <Building className="text-yellow-300" size={20} />
              <span className="text-sm font-semibold">
                Amhara Innovation Technology Bureau
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Advancing Technology
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                For Amhara Region
              </span>
            </h1>

            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              Official feedback and issue tracking portal for monitoring
              technology initiatives, collecting stakeholder feedback, and
              managing innovation projects across the Amhara region.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:shadow-yellow-500/30 hover:scale-105"
              >
                <Building size={20} />
                Register as Partner
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/25 transition-all duration-300 border-2 border-white/30 flex items-center justify-center gap-2 hover:scale-105"
              >
                <FileText size={20} />
                Submit Feedback
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-200 text-sm font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center">
            <div className="w-1.5 h-4 bg-yellow-300 rounded-full mt-3"></div>
          </div>
        </div>
      </div>

      {/* AITB Values Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F4C81] mb-4">
              Our Core Values & Mission
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Committed to driving technological innovation and digital
              transformation across the Amhara region through transparent and
              efficient governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Technology Management Platform
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Designed specifically for government innovation bureaus to
              streamline operations, enhance transparency, and improve citizen
              engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-8 rounded-2xl border-2 ${feature.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className="w-14 h-14 rounded-xl bg-white shadow-md flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Updated CTA Section for AITB */}
      <div className="py-20 px-4 bg-gradient-to-r from-[#2E8B57] to-[#0F4C81]">
        <div className="max-w-5xl mx-auto text-center">
          {/* AITB Logo/Header */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20">
            <Building className="text-yellow-300" size={24} />
            <span className="text-white font-bold text-lg">
              Amhara Innovation Technology Bureau
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Digital Transformation Journey
          </h2>

          <p className="text-blue-100 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
            As part of the Amhara region's commitment to technological
            advancement, this platform enables government agencies, innovation
            partners, and citizens to collaborate effectively on technology
            initiatives.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-left max-w-sm">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Target className="text-yellow-300" />
                For Government Agencies
              </h4>
              <ul className="text-blue-100 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Track innovation project progress
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Monitor stakeholder feedback
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Generate performance reports
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-left max-w-sm">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Lightbulb className="text-green-300" />
                For Innovation Partners
              </h4>
              <ul className="text-blue-100 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Submit technology proposals
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Report project updates
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Access government resources
                </li>
              </ul>
            </div>
          </div>

          {/* Main CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl hover:shadow-yellow-500/30 hover:scale-105"
            >
              <Building size={22} />
              Register Your Organization
              <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <FileText size={22} />
              Access Platform
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-100 mb-4">
              For government inquiries and technical support:
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="mailto:info@aitb.amhara.gov.et"
                className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                info@aitb.amhara.gov.et
              </a>
              <a
                href="tel:+251XXXXXXXXX"
                className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                <Phone size={16} />
                +251 XXX XXX XXX
              </a>
              <div className="text-white flex items-center gap-2">
                <Building size={16} />
                Amhara Regional Government Complex
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}