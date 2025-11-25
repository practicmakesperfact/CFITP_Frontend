import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

export default function FileUploader({ onUpload, isUploading }) {
  const onDrop = (acceptedFiles) => {
    acceptedFiles.forEach((file) => onUpload(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
        isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? "Drop files here"
          : "Drag & drop files here, or click to select"}
      </p>
      {isUploading && <p className="mt-2 text-primary">Uploading...</p>}
    </div>
  );
}


