import { useDropzone } from "react-dropzone";
import { Upload, File, X } from "lucide-react";
import { useState } from "react";

export default function FileUploader({
  onUpload,
  isUploading,
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt",
  maxSize = 10 * 1024 * 1024,
  multiple = false,
}) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const onDrop = (acceptedFiles, rejectedFiles) => {
    setError("");

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === "file-too-large") {
        setError(
          `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
        );
      } else if (rejection.errors[0].code === "file-invalid-type") {
        setError("Invalid file type");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      // Call parent upload handler with all files
      if (multiple) {
        onUpload(acceptedFiles);
      } else {
        onUpload(acceptedFiles[0]);
      }
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: accept
      ? {
          "image/*": [],
          "application/pdf": [".pdf"],
          "application/msword": [".doc"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            [".docx"],
          "application/vnd.ms-excel": [".xls"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
            ".xlsx",
          ],
          "text/plain": [".txt"],
        }
      : undefined,
    multiple,
    disabled: isUploading,
  });

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-teal-500 bg-teal-50"
            : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
        } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`mx-auto h-10 w-10 ${
            isDragActive ? "text-teal-500" : "text-gray-400"
          }`}
        />

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-gray-500 mt-1">or click to browse</p>
          <p className="text-xs text-gray-400 mt-2">
            Supports images, PDF, Word, Excel, text files (Max{" "}
            {maxSize / (1024 * 1024)}MB)
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Uploading status */}
      {isUploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-teal-500"></div>
              <p className="text-sm text-blue-600">Uploading file...</p>
            </div>
            <span className="text-xs text-blue-500">Please wait</span>
          </div>
        </div>
      )}

      {/* Selected files preview */}
      {files.length > 0 && !isUploading && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected files:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB •{" "}
                    {file.type || "Unknown type"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
