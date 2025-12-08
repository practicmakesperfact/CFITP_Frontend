
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import FileUploader from "../../components/UI/FileUploader.jsx";
import { issuesApi } from "../../api/issuesApi.js";
import toast from "react-hot-toast";

export default function NewIssuePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = JSON.parse(localStorage.getItem("user_profile") || "{}");
  const userName = user.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Client User";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("bug"); 
  const [attachments, setAttachments] = useState([]);

  const createMutation = useMutation({
    mutationFn: (formData) => issuesApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.resetQueries({ queryKey: ["issues"] }); // ← THIS FORCES FRESH DATA
      toast.success("Issue created successfully!");
      navigate("/app/issues");
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Failed to create issue");
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!description.trim()) return toast.error("Description is required");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("type", type);
    formData.append("created_by_name", userName);

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    createMutation.mutate(formData); 
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-10 px-6"
    >
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5A4] transition font-medium"
        >
          <ArrowLeft size={22} /> Back
        </button>
        <h1 className="text-4xl font-bold text-slate-800">Create New Issue</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 space-y-8">
        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-3">
            Issue Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Login button not working"
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#0EA5A4] focus:ring-4 focus:ring-teal-100 text-lg transition"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-3">
            Issue Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#0EA5A4] text-lg"
          >
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="feedback">General Feedback</option>
          </select>
        </div>

        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-3">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            placeholder="Describe the problem in detail..."
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#0EA5A4] focus:ring-4 focus:ring-teal-100 resize-none text-lg transition"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-5">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-6">
            {["low", "medium", "high"].map((level) => (
              <label
                key={level}
                className={`flex items-center justify-center gap-4 p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                  priority === level
                    ? "border-[#0EA5A4] bg-teal-50 shadow-lg"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={level}
                  checked={priority === level}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-6 h-6 text-[#0EA5A4]"
                />
                <span className="text-lg font-semibold capitalize">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="w-full bg-[#0EA5A4] hover:bg-[#0d8c8b] disabled:opacity-70 text-white py-5 rounded-2xl text-xl font-bold transition shadow-xl"
          >
            {createMutation.isPending ? "Creating Issue..." : "Submit Issue"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
