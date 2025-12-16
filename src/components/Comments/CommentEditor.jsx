
import React, { useState } from 'react';
import { Paperclip, X } from 'lucide-react';

export default function CommentEditor({ onPost, issueId, visibility, onVisibilityChange, isSubmitting }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  
  const handleFileSelect = (event) => {
    const selected = Array.from(event.target.files);
    // Validate file size (10MB max)
    const validFiles = selected.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length !== selected.length) {
      alert("Some files exceed the 10MB limit");
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    
    try {
      await onPost(content, files);
      setContent('');
      setFiles([]);
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* File preview area */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
              <Paperclip size={14} />
              <span className="text-sm truncate max-w-xs">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment or attach files..."
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        rows={3}
      />
      
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Paperclip size={16} />
            <span className="text-sm">Attach files</span>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </label>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && files.length === 0)}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </div>
  );
}