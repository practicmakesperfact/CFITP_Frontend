import {
  FileText,
  Scale,
  AlertCircle,
  CheckCircle,
  Shield,
} from "lucide-react";
import { useState } from "react";

export default function TermsOfServicePage() {
  const [accepted, setAccepted] = useState(false);
  const effectiveDate = "December 1, 2023";

  const terms = [
    {
      title: "Acceptance",
      content: "By using this platform, you agree to these terms.",
    },
    {
      title: "Account Security",
      content: "You are responsible for keeping your account secure.",
    },
    {
      title: "Proper Use",
      content:
        "Use the platform only for its intended purpose - issue tracking and feedback.",
    },
    {
      title: "Respect Others",
      content: "Do not harass, abuse, or harm other users.",
    },
    {
      title: "No Illegal Activities",
      content: "Do not use the platform for illegal purposes.",
    },
    {
      title: "Content Ownership",
      content:
        "You own what you submit. We only use it to provide the service.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Scale className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-teal-100">Effective: {effectiveDate}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-1" size={20} />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Important</h3>
              <p className="text-gray-700 text-sm">
                These terms govern your use of our issue tracking platform. By
                creating an account, you agree to these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Terms List */}
        <div className="space-y-4 mb-8">
          {terms.map((term, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-50 rounded flex items-center justify-center">
                  <span className="text-teal-600 font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{term.title}</h3>
                  <p className="text-gray-700">{term.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Guidelines */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">User Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-green-700 font-medium mb-2 flex items-center gap-2">
                <CheckCircle size={16} />
                Allowed
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Submit issues and feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Communicate with support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>Track issue progress</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-red-700 font-medium mb-2">Not Allowed</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Share your login</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Upload harmful content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>Access others' data</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Acceptance */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">Agreement</h3>

          <div className="flex items-center gap-3 mb-6">
            <input
              type="checkbox"
              id="agree"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
              className="h-5 w-5 text-teal-600 rounded"
            />
            <label htmlFor="agree" className="text-gray-700">
              I have read and agree to the Terms of Service
            </label>
          </div>

          {accepted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="text-green-500" size={20} />
              <span className="text-green-700 font-medium">
                Thank you for agreeing
              </span>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/privacy"
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
              >
                <Shield size={16} />
                Privacy Policy
              </a>
              <a
                href="/help"
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
              >
                <FileText size={16} />
                Help Center
              </a>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Questions? Contact: legal@aitb.cfitp.com</p>
          <p className="mt-1">Bahir Dar Institute of Technology</p>
        </div>
      </div>
    </div>
  );
}
