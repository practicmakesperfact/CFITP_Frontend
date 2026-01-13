import { Shield, Lock, Eye, FileText, CheckCircle } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 1, 2023";

  const sections = [
    {
      icon: <Eye className="text-teal-600" size={18} />,
      title: "What We Collect",
      points: [
        "Your name and email when you register",
        "Issues and feedback you submit",
        "How you use our platform",
      ],
    },
    {
      icon: <FileText className="text-teal-600" size={18} />,
      title: "How We Use Data",
      points: [
        "To provide our service",
        "To improve the platform",
        "To communicate with you",
        "For security purposes",
      ],
    },
    {
      icon: <Lock className="text-teal-600" size={18} />,
      title: "Data Security",
      points: [
        "Encrypted data storage",
        "Secure access controls",
        "Regular security updates",
      ],
    },
    {
      icon: <Shield className="text-teal-600" size={18} />,
      title: "Your Rights",
      points: [
        "Access your data",
        "Correct information",
        "Delete your account",
        "Export your data",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Shield className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-teal-100">Last Updated: {lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Our Commitment
          </h2>
          <p className="text-gray-700">
            We respect your privacy and protect your personal information. This
            policy explains how we handle data in our issue tracking platform.
          </p>
        </div>

        {/* Main Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-teal-50 rounded">{section.icon}</div>
                <h3 className="text-lg font-bold text-gray-900">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {section.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle className="text-teal-500 mt-0.5" size={16} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Data Retention */}
        <div className="mt-8 bg-teal-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Data Retention</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded p-4">
              <h4 className="font-medium text-gray-900 mb-1">
                Active Accounts
              </h4>
              <p className="text-sm text-gray-600">Kept while active</p>
            </div>
            <div className="bg-white rounded p-4">
              <h4 className="font-medium text-gray-900 mb-1">
                Inactive Accounts
              </h4>
              <p className="text-sm text-gray-600">Deleted after 2 years</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Questions?</h3>
          <p className="text-gray-700 mb-4">
            If you have questions about privacy or want to exercise your rights:
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">Email</h4>
              <a
                href="mailto:privacy@aitb.edu.et"
                className="text-teal-600 hover:text-teal-700"
              >
                privacy@cfitp.com
              </a>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Location</h4>
              <p className="text-gray-600">
                Bahir Dar Institute of Technology, Ethiopia
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            By using our service, you agree to this privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
