// src/components/Issues/AssignModal.jsx - UPDATED
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail } from "lucide-react";
import { issuesApi } from "../../api/issuesApi";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AssignModal({ issue, staffUsers, onClose, onAssign }) {
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState(null);

  // SAFE ARRAY HANDLING - Ensure staffUsers is always an array
  const safeStaffUsers = Array.isArray(staffUsers) ? staffUsers : [];

  console.log("Staff users in modal:", safeStaffUsers); // Debug log

  const assignMutation = useMutation({
    mutationFn: ({ issueId, assigneeId }) =>
      issuesApi.assign(issueId, { assignee_id: assigneeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues-all"] });
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success(`Issue assigned to ${selectedStaff?.email}`);
      onAssign();
    },
    onError: (error) => {
      toast.error("Failed to assign staff");
      console.error("Assignment error:", error);
    },
  });

  const handleAssign = () => {
    if (!selectedStaff) {
      toast.error("Please select a staff member");
      return;
    }

    assignMutation.mutate({
      issueId: issue.id,
      assigneeId: selectedStaff.id,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-slate-800">
              Assign Staff to: {issue.title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Staff List */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <p className="text-sm text-slate-600 mb-4">
              Select a staff member to assign this issue:
            </p>

            {safeStaffUsers.length === 0 ? (
              <div className="text-center py-8">
                <User size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No staff members available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please add staff users in the admin panel
                </p>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Debug: staffUsers = {JSON.stringify(staffUsers)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {safeStaffUsers.map((staff) => (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedStaff?.id === staff.id
                        ? "border-[#0EA5A4] bg-teal-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0EA5A4] rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {staff.first_name && staff.last_name
                            ? `${staff.first_name} ${staff.last_name}`
                            : staff.email}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Mail size={14} />
                          {staff.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Role: {staff.role}
                        </p>
                      </div>
                      {selectedStaff?.id === staff.id && (
                        <div className="w-3 h-3 bg-[#0EA5A4] rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedStaff || assignMutation.isPending}
              className="flex-1 px-4 py-3 bg-[#0EA5A4] text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign Staff"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
