
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

function FileUploader({
  onUpload,
  multiple = true,
  maxSize = 10 * 1024 * 1024,
}) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(multiple ? acceptedFiles : acceptedFiles[0]);
      }
    },
    [onUpload, multiple]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxSize,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-teal-500 bg-teal-50"
          : "border-gray-300 hover:border-teal-400 hover:bg-gray-50"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
      <p className="text-gray-700 mb-1">
        {isDragActive
          ? "Drop files here..."
          : "Drag & drop files here, or click to browse"}
      </p>
      <p className="text-sm text-gray-500">
        Supports images, PDF, Word, text files (Max 10MB)
      </p>
      <p className="text-xs text-gray-400 mt-2">
        Click or drag to upload screenshots for clarification
      </p>
    </div>
  );
}

export default FileUploader;
