import React, { useState, useEffect } from "react";
import { X, User, Mail, Check, AlertCircle } from "lucide-react";
import Button from "../UI/Button";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AssignModal({
  issue,
  staffUsers,
  onClose,
  onAssign,
  isLoading,
  currentAssignee,
}) {
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Reset selection when modal opens
  useEffect(() => {
    setSelectedUserId(null);
  }, [staffUsers]);

  const getDisplayName = (userData) => {
    if (!userData) return "";
    if (typeof userData === "string") return userData;
    if (typeof userData === "object") {
      if (userData.name) return userData.name;
      if (userData.first_name && userData.last_name) {
        return `${userData.first_name} ${userData.last_name}`;
      }
      if (userData.email) return userData.email.split("@")[0];
      if (userData.username) return userData.username;
    }
    return "";
  };

  const getEmail = (userData) => {
    if (!userData) return "";
    if (typeof userData === "string" && userData.includes("@")) return userData;
    if (typeof userData === "object" && userData.email) {
      return userData.email;
    }
    return "";
  };

  const handleAssign = () => {
    if (!selectedUserId) {
      toast.error("Please select a staff member");
      return;
    }

    // Check if trying to assign to current assignee
    if (currentAssignee?.id === selectedUserId) {
      const selectedUser = staffUsers.find((u) => u.id === selectedUserId);
      toast.error(
        `This issue is already assigned to ${getDisplayName(selectedUser)}`,
        {
          duration: 4000,
          style: {
            background: "#fef3c7",
            color: "#92400e",
          },
        }
      );
      return;
    }

    onAssign(selectedUserId);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header - Clean and simple */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {currentAssignee ? "Reassign Staff" : "Assign Staff"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Select a staff member to{" "}
                {currentAssignee ? "reassign" : "assign"} this issue
              </p>
              {issue?.title && (
                <div className="mt-2">
                  
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Current assignee warning */}
          {currentAssignee && (
            <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-blue-500 mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-blue-700 text-sm font-medium">
                    Currently assigned to: {getDisplayName(currentAssignee)}
                  </p>
                  {getEmail(currentAssignee) && (
                    <p className="text-blue-600 text-xs mt-1">
                      {getEmail(currentAssignee)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Staff list - Clean card style */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <h3 className="font-medium text-gray-900 mb-4">
              Select Staff Member{" "}
              {staffUsers.length > 0 && `(${staffUsers.length} available)`}
            </h3>

            {staffUsers.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-700 font-medium">No staff available</p>
                <p className="text-gray-500 text-sm mt-1">
                  Add staff users to assign issues
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {staffUsers.map((staff) => {
                  const isSelected = selectedUserId === staff.id;
                  const isCurrentAssignee = currentAssignee?.id === staff.id;

                  return (
                    <div
                      key={staff.id}
                      onClick={() => {
                        if (!isCurrentAssignee && !isLoading) {
                          setSelectedUserId(staff.id);
                        }
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isCurrentAssignee
                          ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-70"
                          : isSelected
                          ? "bg-teal-50 border-teal-300 ring-2 ring-teal-200"
                          : "hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCurrentAssignee ? "bg-gray-400" : "bg-teal-500"
                            }`}
                          >
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getDisplayName(staff)}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Mail size={12} /> {getEmail(staff)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCurrentAssignee && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                              Current
                            </span>
                          )}
                          {isSelected && !isCurrentAssignee && (
                            <Check size={20} className="text-teal-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssign}
                disabled={!selectedUserId || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Assigning...
                  </>
                ) : currentAssignee ? (
                  "Reassign"
                ) : (
                  "Assign"
                )}
              </Button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
