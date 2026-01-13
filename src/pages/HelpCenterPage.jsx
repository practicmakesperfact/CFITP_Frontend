import { useState } from "react";
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Users,
  Star,
} from "lucide-react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQs, setExpandedFAQs] = useState({});

  const categories = [
    {
      icon: <BookOpen className="text-teal-600" size={20} />,
      title: "Getting Started",
      description: "Learn the basics",
      count: 5,
    },
    {
      icon: <MessageSquare className="text-teal-600" size={20} />,
      title: "Issues",
      description: "Submit & track problems",
      count: 8,
    },
    {
      icon: <FileText className="text-teal-600" size={20} />,
      title: "Reports",
      description: "Generate analytics",
      count: 3,
    },
    {
      icon: <Users className="text-teal-600" size={20} />,
      title: "Account",
      description: "Manage your profile",
      count: 4,
    },
  ];

  const faqs = [
    {
      question: "How do I submit a new issue?",
      answer: "Go to Issues page → Click 'New Issue' → Fill details → Submit.",
    },
    {
      question: "Can I attach files to issues?",
      answer: "Yes, you can attach images and documents up to 10MB each.",
    },
    {
      question: "How do I track my issue status?",
      answer:
        "Check your dashboard or the issue detail page for real-time updates.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Go to login page → Click 'Forgot Password' → Follow email instructions.",
    },
    {
      question: "Who can see my issues?",
      answer: "Only assigned staff and administrators in your organization.",
    },
    {
      question: "How long does issue resolution take?",
      answer: "Depends on priority. High: 24h, Medium: 3 days, Low: 7 days.",
    },
  ];

  const quickLinks = [
    { icon: <Phone size={16} />, text: "+251 58 220 0000", label: "Phone" },
    { icon: <Mail size={16} />, text: "support@aitb.edu.et", label: "Email" },
    {
      icon: <Clock size={16} />,
      text: "Mon-Fri, 8:30AM-5:30PM",
      label: "Hours",
    },
    {
      icon: <MapPin size={16} />,
      text: "Bahir Dar, Ethiopia",
      label: "Location",
    },
  ];

  const toggleFAQ = (index) => {
    setExpandedFAQs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-teal-500/20 rounded-xl">
                <HelpCircle className="text-white" size={32} />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-3">Help Center</h1>
            <p className="text-teal-100">
              Bahir Dar Institute of Technology - AITB
            </p>
          </div>

         
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
          

            {/* FAQs */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="divide-y">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-6">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex justify-between items-start text-left"
                    >
                      <span className="font-medium text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      {expandedFAQs[index] ? (
                        <ChevronUp
                          className="text-teal-600 flex-shrink-0"
                          size={20}
                        />
                      ) : (
                        <ChevronDown
                          className="text-gray-400 flex-shrink-0"
                          size={20}
                        />
                      )}
                    </button>
                    {expandedFAQs[index] && (
                      <div className="mt-3 text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="text-teal-600" size={18} />
                Contact Information
              </h3>
              <div className="space-y-4">
                {quickLinks.map((link, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded">{link.icon}</div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {link.text}
                      </div>
                      <div className="text-sm text-gray-500">{link.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-teal-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <Star className="text-teal-600 mt-0.5" size={14} />
                  <span>Include screenshots for faster issue resolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="text-teal-600 mt-0.5" size={14} />
                  <span>Check email for notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="text-teal-600 mt-0.5" size={14} />
                  <span>Use clear titles when submitting issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="text-teal-600 mt-0.5" size={14} />
                  <span>Update your profile information regularly</span>
                </li>
              </ul>
            </div>

            {/* Security Note */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="text-teal-600" size={20} />
                <h3 className="font-bold text-gray-900">Security Notice</h3>
              </div>
              <p className="text-sm text-gray-600">
                Never share your login credentials. Our support team will never
                ask for your password. All communications are encrypted and
                secure.
              </p>
            </div>

            {/* AITB Info */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl p-6">
              <h3 className="font-bold mb-3">
                Bahir Dar Institute of Technology
              </h3>
              <p className="text-teal-100 text-sm mb-4">
                Providing technical support and issue tracking for students,
                staff, and faculty.
              </p>
              <div className="text-xs text-teal-200">
                <p>Bahir Dar, Ethiopia</p>
                <p>የባህር ዳር ቴክኖሎጂ ኢንስቲትዩት</p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}
