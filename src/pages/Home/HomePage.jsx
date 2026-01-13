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
  Bug,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  // Features data - Focused on Feedback and Issue Tracking
  const features = [
    {
      icon: <Bug className="text-[#0F4C81]" size={24} />,
      title: "Issue Reporting & Tracking",
      description:
        "Clients can report technical issues while staff track progress from submission to resolution.",
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: <MessageSquare className="text-[#2E8B57]" size={24} />,
      title: "Feedback Collection System",
      description:
        "Collect and organize feedback from stakeholders to improve services and products.",
      color: "bg-green-50 border-green-200",
    },
    {
      icon: <AlertTriangle className="text-[#8B4513]" size={24} />,
      title: "Priority Issue Management",
      description:
        "Categorize and prioritize issues based on severity with automated notifications.",
      color: "bg-amber-50 border-amber-200",
    },
    {
      icon: <CheckCircle className="text-[#6A5ACD]" size={24} />,
      title: "Resolution Workflow",
      description:
        "Structured workflow from Open → In Progress → Resolved with clear accountability.",
      color: "bg-purple-50 border-purple-200",
    },
    {
      icon: <BarChart3 className="text-[#008080]" size={24} />,
      title: "Performance Analytics Dashboard",
      description:
        "Monitor response times, resolution rates, and customer satisfaction metrics.",
      color: "bg-teal-50 border-teal-200",
    },
    {
      icon: <TrendingUp className="text-[#8B0000]" size={24} />,
      title: "Service Improvement Insights",
      description:
        "Identify trends and patterns to proactively improve service quality.",
      color: "bg-red-50 border-red-200",
    },
  ];

  // Stats data for AITB Issue Tracking
  const stats = [
    { number: "95%", label: "Issue Resolution Rate" },
    { number: "<2hr", label: "Average Response Time" },
    { number: "500+", label: "Issues Tracked Monthly" },
    { number: "98%", label: "Client Satisfaction" },
  ];

  // AITB Platform Values
  const values = [
    {
      icon: <Target className="text-green-600" size={20} />,
      title: "Efficient Resolution",
      description: "Streamlined workflow for quick issue resolution",
    },
    {
      icon: <Shield className="text-blue-600" size={20} />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for all communications",
    },
    {
      icon: <Users className="text-purple-600" size={20} />,
      title: "Transparent Communication",
      description: "Clear tracking and updates for all stakeholders",
    },
    {
      icon: <BarChart3 className="text-orange-600" size={20} />,
      title: "Data-Driven Improvement",
      description: "Analytics to continuously enhance service quality",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15, 76, 129, 0.85), rgba(15, 76, 129, 0.9)), url('/src/assets/company-background.jpg')",
        }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Platform Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 border border-white/30">
              <Building className="text-yellow-300" size={20} />
              <span className="text-sm font-semibold">
                Client Feedback & Issue Tracking Portal
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Streamline Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                Issue Resolution Process
              </span>
            </h1>

            <p className="text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              The official platform for Amhara Innovation Technology Bureau to
              manage client feedback, track technical issues, and enhance
              service delivery through systematic issue management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl hover:shadow-yellow-500/30 hover:scale-105"
              >
                <Users size={20} />
                Register Your Organization
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/25 transition-all duration-300 border-2 border-white/30 flex items-center justify-center gap-2 hover:scale-105"
              >
                <Bug size={20} />
                Report an Issue
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

      {/* Platform Benefits Section */}
      <div className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0F4C81] mb-4">
              Why Choose Our Issue Tracking Platform
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              A comprehensive solution designed specifically for government
              technology bureaus to efficiently manage feedback and resolve
              technical issues.
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
              Comprehensive Issue & Feedback Management
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Everything you need to collect feedback, track issues, and improve
              service delivery in one integrated platform.
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

      {/* CTA Section */}
      <div className="py-20 px-4 bg-gradient-to-r from-[#2E8B57] to-[#0F4C81]">
        <div className="max-w-5xl mx-auto text-center">
          {/* Platform Header */}
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-white/20">
            <Building className="text-yellow-300" size={24} />
            <span className="text-white font-bold text-lg">
              AITB Issue Tracking Portal
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6">
            Start Managing Feedback Effectively Today
          </h2>

          <p className="text-blue-100 text-lg mb-10 max-w-3xl mx-auto leading-relaxed">
            Join government agencies, technology partners, and service providers
            in using our platform to streamline issue resolution and improve
            customer satisfaction.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-left max-w-sm">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Users className="text-yellow-300" />
                For Service Teams
              </h4>
              <ul className="text-blue-100 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Track assigned issues and feedback
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Monitor resolution timelines
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mt-1.5"></div>
                  Collaborate with team members
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 text-left max-w-sm">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <MessageSquare className="text-green-300" />
                For Clients & Partners
              </h4>
              <ul className="text-blue-100 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Submit feedback and issues easily
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Track resolution progress in real-time
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full mt-1.5"></div>
                  Communicate directly with support teams
                </li>
              </ul>
            </div>
          </div>


          {/* Contact Information */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-blue-100 mb-4">
              Need help or have questions about the portal?
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="mailto:support@aitb-portal.gov.et"
                className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                support@gmail.com
              </a>
              <a
                href="tel:+251XXXXXXXXX"
                className="text-white hover:text-yellow-300 transition-colors flex items-center gap-2"
              >
                <Phone size={16} />
                Support Hotline: +251 XXX XXX XXX
              </a>
              <div className="text-white flex items-center gap-2">
                <Building size={16} />
                Amhara Innovation Technology Bureau
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
