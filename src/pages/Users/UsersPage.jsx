// src/pages/Users/UsersPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password] = useState("client123"); // ← Fixed for demo

  const handleCreateClient = (e) => {
    e.preventDefault();

    // FAKE: Just show success + copy-paste login info
    const loginInfo = `
      CLIENT ACCOUNT CREATED!

      Email: ${email}
      Password: ${password}

      Login here: http://localhost:3000/login
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(loginInfo);

    toast.success(
      <div>
        Client created! Login details copied to clipboard
        <pre className="text-xs bg-gray-100 p-2 mt-2 rounded">
          Email: {email}
          <br />
          Password: {password}
        </pre>
      </div>,
      { duration: 8000 }
    );

    setEmail("");
    setFirstName("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <h1 className="text-3xl font-bold text-slate-800">
        User Management (Admin)
      </h1>

      {/* Fake Client Creation Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-2xl">
        <h2 className="text-2xl font-semibold mb-6 text-[#0EA5A4]">
          Add New Client
        </h2>

        <form onSubmit={handleCreateClient} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@company.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0EA5A4] focus:border-transparent"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Demo Mode:</strong> All clients use password:{" "}
              <code className="bg-amber-200 px-2 py-1 rounded">client123</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0EA5A4] hover:bg-[#0d8c8b] text-white font-bold py-4 rounded-xl transition transform hover:scale-105 shadow-lg"
          >
            Create Client Account (Copy Login Details)
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            After clicking, login details are copied to clipboard.
            <br />
            Send them to your client via WhatsApp/email.
          </p>
        </div>
      </div>

      {/* Fake Users List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-xl font-semibold mb-4">Demo Accounts</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>admin@cfitp.com</span>
            <span className="font-mono text-green-600">admin123</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>manager@cfitp.com</span>
            <span className="font-mono text-purple-600">manager123</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded">
            <span>staff@cfitp.com</span>
            <span className="font-mono text-blue-600">staff123</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
