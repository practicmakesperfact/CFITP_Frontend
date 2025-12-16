
import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "../../api/axiosClient";

export default function ImageModal({ attachmentId, onClose }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState(null);

  // Fetch attachment data
  useEffect(() => {
    const fetchAttachment = async () => {
      if (!attachmentId) return;

      setIsLoading(true);
      setError(null);
      setImageUrl(null);

      try {
        // Get attachment info first
        const infoResponse = await axiosClient.get(
          `/attachments/${attachmentId}/`
        );
        const attachment = infoResponse.data;
        setAttachmentInfo(attachment);

        // Try to get image preview with authentication
        try {
          const response = await axiosClient.get(
            `/attachments/${attachmentId}/preview/`,
            {
              responseType: "blob",
            }
          );

          // Create object URL from blob
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        } catch (previewError) {
          console.log(
            "Preview endpoint failed, trying direct download:",
            previewError
          );

          // Fallback to download endpoint
          try {
            const downloadResponse = await axiosClient.get(
              `/attachments/${attachmentId}/download/`,
              {
                responseType: "blob",
              }
            );

            const blob = new Blob([downloadResponse.data], {
              type: downloadResponse.headers["content-type"],
            });
            const url = URL.createObjectURL(blob);
            setImageUrl(url);
          } catch (downloadError) {
            throw new Error("Failed to load image from both endpoints");
          }
        }
      } catch (err) {
        console.error("Error loading attachment:", err);
        setError("Failed to load image. Please try downloading instead.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttachment();

    // Cleanup function to revoke object URL
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [attachmentId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleDownload = async () => {
    if (!attachmentInfo) return;

    try {
      const response = await axiosClient.get(
        `/attachments/${attachmentId}/download/`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download =
        attachmentInfo.filename || `attachment-${attachmentId}.png`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file");
    }
  };

  // If no attachmentId, don't render
  if (!attachmentId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
        onClick={onClose}
      >
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Main content */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              <p className="text-white/80 text-lg">Loading image...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 text-center p-8">
              <AlertCircle className="w-16 h-16 text-red-400" />
              <p className="text-white text-xl">{error}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                Close
              </button>
            </div>
          ) : imageUrl ? (
            <>
              {/* Image with zoom and rotation */}
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: scale, opacity: 1 }}
                src={imageUrl}
                alt={attachmentInfo?.filename || "Preview"}
                className="max-w-[90vw] max-h-[80vh] object-contain select-none"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                }}
                draggable="false"
              />

              {/* Controls - Bottom center */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm rounded-full px-6 py-3">
                {/* Zoom controls */}
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 min-w-[120px]">
                  <span className="text-white text-sm">
                    {Math.round(scale * 100)}%
                  </span>
                  <input
                    type="range"
                    min="25"
                    max="300"
                    value={scale * 100}
                    onChange={(e) => setScale(e.target.value / 100)}
                    className="w-24 accent-teal-500"
                  />
                </div>

                <button
                  onClick={handleZoomIn}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>

                {/* Separator */}
                <div className="h-6 w-px bg-white/30"></div>

                {/* Rotate */}
                <button
                  onClick={handleRotate}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                  title="Rotate (R)"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-white hover:bg-white/20 rounded-full transition-colors text-sm"
                  title="Reset"
                >
                  Reset
                </button>

                {/* Separator */}
                <div className="h-6 w-px bg-white/30"></div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="px-3 py-1 text-white hover:bg-white/20 rounded-full transition-colors text-sm flex items-center gap-2"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                  {isFullscreen ? "Exit" : "Fullscreen"}
                </button>

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors text-sm flex items-center gap-2"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                <p className="text-white/60 text-sm whitespace-nowrap">
                  Scroll to zoom • + / - to zoom • R to rotate • ESC to close
                </p>
              </div>
            </>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
