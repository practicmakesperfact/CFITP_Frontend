import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../app/hooks"; // Import useAuth

export default function ImageModal({ attachmentId, onClose }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const { getAccessToken } = useAuth(); // Get auth hook

  // Function to get authenticated image URL
  const getAuthenticatedImageUrl = async (attachmentId, usePreview = true) => {
    try {
      // Get the access token
      const token = getAccessToken?.() || localStorage.getItem("access_token");

      if (usePreview) {
        // For image preview endpoint
        return `${axiosClient.defaults.baseURL}/attachments/${attachmentId}/preview/`;
      } else {
        // For download endpoint
        return `${axiosClient.defaults.baseURL}/attachments/${attachmentId}/download/`;
      }
    } catch (err) {
      console.error("Error getting auth token:", err);
      return null;
    }
  };

  // Fetch attachment data and image
  useEffect(() => {
    // In your ImageModal component, update the fetch function:
    const fetchAttachment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get attachment info
        const infoResponse = await axiosClient.get(
          `/attachments/${attachmentId}/`
        );
        const attachment = infoResponse.data;
        setAttachmentInfo(attachment);

        // Get a view token for the image
        const tokenResponse = await axiosClient.get(
          `/attachments/${attachmentId}/get-view-token/`
        );
        const { preview_url } = tokenResponse.data;

        setImageUrl(preview_url);
      } catch (err) {
        console.error("Error loading attachment:", err);
        setError("Failed to load image");
      } finally {
        setIsLoading(false);
      }
    };

    if (attachmentId) {
      fetchAttachment();
    }
  }, [attachmentId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "r") handleRotate();
      if (e.key === "f") toggleFullscreen();
      if (e.key === "i") setShowInfo((prev) => !prev);
      if (e.key === "ArrowRight") handleNext(); // If you implement gallery
      if (e.key === "ArrowLeft") handlePrev(); // If you implement gallery
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, []);

  useEffect(() => {
    const modal = document.querySelector(".image-modal-container");
    if (modal) {
      modal.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (modal) {
        modal.removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

 const handleDownload = async () => {
   try {
     // Use axiosClient for authenticated download
     const response = await axiosClient.get(
       `/attachments/${attachmentId}/download/`,
       {
         responseType: "blob",
       }
     );

     // Create download link
     const url = window.URL.createObjectURL(new Blob([response.data]));
     const link = document.createElement("a");
     link.href = url;
     link.setAttribute("download", attachmentInfo?.filename || "attachment");
     document.body.appendChild(link);
     link.click();

     // Cleanup
     setTimeout(() => {
       link.remove();
       window.URL.revokeObjectURL(url);
     }, 100);
   } catch (err) {
     console.error("Download failed:", err);
     alert("Failed to download file");
   }
 };


  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
      >
        <div
          className="text-center p-8 bg-gray-800 rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 image-modal-container"
        onClick={onClose}
      >
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
          <div className="flex items-center gap-4">
            {attachmentInfo && (
              <div className="text-white">
                <h3 className="font-medium truncate max-w-xs">
                  {attachmentInfo.filename}
                </h3>
                {attachmentInfo.size && (
                  <p className="text-sm text-gray-300">
                    {Math.round(attachmentInfo.size / 1024)} KB
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Main Image Area */}
        <div
          className="relative flex-1 flex items-center justify-center h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-white/70">Loading image...</p>
            </div>
          ) : imageUrl ? (
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: scale, opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={imageUrl}
              alt={attachmentInfo?.filename || "Preview"}
              className="max-w-full max-h-[80vh] object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
              draggable={false}
            />
          ) : null}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
          <div className="flex flex-col items-center gap-4">
            {/* Zoom and Transform Controls */}
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut size={20} />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-white text-sm w-16 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <input
                  type="range"
                  min="25"
                  max="300"
                  value={scale * 100}
                  onChange={(e) => setScale(e.target.value / 100)}
                  className="w-32"
                />
              </div>

              <button
                onClick={handleZoomIn}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn size={20} />
              </button>

              <div className="h-6 w-px bg-white/30 mx-1"></div>

              <button
                onClick={handleRotate}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title="Rotate (R)"
              >
                <RotateCw size={20} />
              </button>

              <button
                onClick={handleReset}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                title="Reset"
              >
                Reset
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 size={16} />
                ) : (
                  <Maximize2 size={16} />
                )}
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"} (F)
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors"
              >
                <Download size={16} />
                Download
              </button>

              <button
                onClick={() => setShowInfo((prev) => !prev)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                title="Show Info (I)"
              >
                ℹ️ Info
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <AnimatePresence>
          {showInfo && attachmentInfo && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute right-4 top-20 bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 w-80 z-20"
            >
              <h4 className="text-white font-medium mb-3">Attachment Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Filename:</span>
                  <span className="text-white">{attachmentInfo.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{attachmentInfo.mime_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">
                    {Math.round(attachmentInfo.size / 1024)} KB
                  </span>
                </div>
                {attachmentInfo.uploaded_by && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uploaded by:</span>
                    <span className="text-white">
                      {attachmentInfo.uploaded_by.name ||
                        attachmentInfo.uploaded_by.email}
                    </span>
                  </div>
                )}
                {attachmentInfo.created_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uploaded:</span>
                    <span className="text-white">
                      {new Date(attachmentInfo.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="absolute bottom-20 text-center w-full">
          <p className="text-white/60 text-sm">
            Scroll to zoom • R to rotate • F for fullscreen • I for info • ESC
            to close
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
