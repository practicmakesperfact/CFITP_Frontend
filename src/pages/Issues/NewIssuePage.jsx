import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { ArrowLeft, Upload, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "../../app/store/uiStore.js";
import mockIssues from "../../api/mockIssues.js"; // Your existing mock
import FileUploader from "../../components/UI/FileUploader.jsx";

const schema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  priority: yup.string().oneOf(["low", "medium", "high"]).default("medium"),
});

export default function NewIssuePage() {
  const navigate = useNavigate();
  const { userRole } = useUIStore();
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // BLOCK NON-CLIENTS
  if (userRole !== "client") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Only <strong>Clients</strong> can create new issues.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#0EA5A4] text-white px-8 py-4 rounded-xl hover:bg-[#0d8c8b] transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Convert files to base64 for localStorage
      const attachments = await Promise.all(
        files.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            base64,
            url: base64, // preview
          };
        })
      );

      const newIssue = {
        ...data,
        id: Date.now(),
        status: "open",
        created_at: new Date().toISOString(),
        created_by: "client@cfitp.com", // current user
        attachments,
      };

      // Save using your existing mock (which uses localStorage)
      await mockIssues.create(newIssue);

      toast.success(
        "Issue submitted successfully! Our team will review it shortly."
      );
      reset();
      setFiles([]);
      setTimeout(() => navigate("/issues"), 1500);
    } catch (err) {
      toast.error("Failed to submit issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6"
    >
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 font-medium"
      >
        <ArrowLeft size={22} />
        Back to Issues
      </button>

      <h1 className="text-4xl font-bold text-slate-800 mb-10">
        Report a New Issue
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl shadow-xl p-10 space-y-10"
      >
        {/* Title */}
        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-3">
            Issue Title
          </label>
          <input
            {...register("title")}
            placeholder="e.g., Payment failed on checkout page"
            className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] focus:ring-4 focus:ring-teal-100 outline-none text-lg transition"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-3">
            Describe the Problem
          </label>
          <textarea
            {...register("description")}
            rows={10}
            placeholder="Please include: steps to reproduce, device/browser used, expected vs actual behavior..."
            className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-[#0EA5A4] focus:ring-4 focus:ring-teal-100 outline-none resize-none text-lg transition"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-2">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-5">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-6">
            {["low", "medium", "high"].map((level) => (
              <label
                key={level}
                className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition border-2 border-transparent has-[:checked]:border-[#0EA5A4] has-[:checked]:bg-teal-50"
              >
                <input
                  type="radio"
                  value={level}
                  {...register("priority")}
                  className="w-6 h-6 text-[#0EA5A4] focus:ring-[#0EA5A4]"
                  defaultChecked={level === "medium"}
                />
                <span className="text-lg font-medium capitalize text-slate-700">
                  {level}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-lg font-semibold text-slate-700 mb-4">
            Attachments (Optional)
          </label>
          <FileUploader files={files} setFiles={setFiles} />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-5 pt-8 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0EA5A4] hover:bg-[#0d8c8b] disabled:opacity-70 text-white px-12 py-5 rounded-2xl font-bold text-lg shadow-xl transition transform hover:scale-105 flex items-center gap-3"
          >
            {isSubmitting ? "Submitting..." : "Submit Issue"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border-2 border-slate-300 text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
