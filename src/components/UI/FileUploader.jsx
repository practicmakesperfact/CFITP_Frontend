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


// // src/components/UI/FileUploader.jsx
// import { useDropzone } from "react-dropzone";
// import { Upload, X } from "lucide-react";

// export default function FileUploader({ files = [], setFiles }) {
//   const onDrop = (acceptedFiles) => {
//     setFiles((prev) => [...prev, ...acceptedFiles]);
//   };

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     multiple: true,
//   });

//   const removeFile = (index) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   return (
//     <div>
//       <div
//         {...getRootProps()}
//         className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
//           isDragActive ? "border-[#0EA5A4] bg-teal-50" : "border-gray-300 hover:border-gray-400"
//         }`}
//       >
//         <input {...getInputProps()} />
//         <Upload size={48} className="mx-auto text-gray-400 mb-4" />
//         <p className="text-lg font-medium text-slate-700">
//           {isDragActive ? "Drop files here" : "Drag & drop files here, or click to select"}
//         </p>
//         <p className="text-sm text-slate-500 mt-2">Images, PDFs, documents up to 10MB</p>
//       </div>

//       {files.length > 0 && (
//         <div className="mt-6 space-y-3">
//           <p className="font-medium text-slate-700">Selected files ({files.length})</p>
//           {files.map((file, i) => (
//             <div key={i} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
//               <div className="flex items-center gap-3">
//                 <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12" />
//                 <div>
//                   <p className="font-medium text-slate-700 truncate max-w-xs">{file.name}</p>
//                   <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                 </div>
//               </div>
//               <button onClick={() => removeFile(i)} className="text-red-600 hover:text-red-700">
//                 <X size={20} />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }