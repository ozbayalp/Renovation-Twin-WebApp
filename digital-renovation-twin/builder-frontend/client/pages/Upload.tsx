import { Layout } from "@/components/Layout";
import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback, useRef } from "react";
import { uploadImages } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [label, setLabel] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/")
    );
    if (droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...droppedFiles]);
      setError(null);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...selectedFiles]);
      setError(null);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await uploadImages(files, label || undefined);
      toast({
        title: "Upload successful!",
        description: `${response.uploaded_files.length} files uploaded. Job ID: ${response.job_id}`,
      });
      // Navigate to results page
      navigate(`/results/${response.job_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-white dark:bg-[#0a0a0a] border-b border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] dark:text-white mb-4">
            Analyze Building Facade
          </h1>
          <p className="text-lg text-[#525252] dark:text-[#999999]">
            Upload high-quality images of your building facade to get a
            comprehensive analysis.
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-[#0a0a0a] py-24">
        <div className="max-w-3xl mx-auto px-6">
          {/* Label Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#111111] dark:text-white mb-2">
              Assessment Label (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Downtown Tower A - North Facade"
              className="w-full px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg text-[#111111] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-white transition-all duration-200"
            />
          </div>

          {/* Upload Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer bg-[#F9FAFB] dark:bg-[#1a1a1a] border-2 border-dashed rounded-lg p-12 text-center mb-8 transition-all duration-300 ${
              isDragging
                ? "border-[#111111] dark:border-white bg-white dark:bg-[#252525]"
                : "border-[#D1D5DB] dark:border-[#333333] hover:border-[#111111] dark:hover:border-white hover:bg-white dark:hover:bg-[#252525]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <svg
              className="w-16 h-16 mx-auto mb-6 text-[#525252] dark:text-[#999999]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h3 className="text-2xl font-bold text-[#111111] dark:text-white mb-2">
              {isDragging ? "Drop images here" : "Drag and drop images here"}
            </h3>
            <p className="text-[#525252] dark:text-[#999999] mb-6">
              or click to select files from your device
            </p>
            <span className="px-6 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium inline-block">
              Select Files
            </span>
            <p className="text-[#737373] dark:text-[#999999] text-sm mt-4">
              Supported formats: JPG, PNG, WebP (up to 50MB)
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mb-8 bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6">
              <h4 className="text-sm font-semibold text-[#111111] dark:text-white mb-4">
                Selected Files ({files.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between py-2 px-3 bg-[#F9FAFB] dark:bg-[#252525] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-[#525252] dark:text-[#999999]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-[#111111] dark:text-white truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="text-xs text-[#737373] dark:text-[#666666]">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="p-1 hover:bg-[#E5E7EB] dark:hover:bg-[#333333] rounded transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-[#737373] dark:text-[#666666]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-8 p-4 bg-[#FEF2F2] dark:bg-[#450A0A] border border-[#FCA5A5] dark:border-[#7F1D1D] rounded-lg">
              <p className="text-sm text-[#DC2626] dark:text-[#FCA5A5]">{error}</p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="w-full px-6 py-4 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium text-lg hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                Start Analysis
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6 hover:border-[#111111] dark:hover:border-white hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F3F4F6] dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#111111] dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">
                Fast Processing
              </h4>
              <p className="text-[#525252] dark:text-[#999999] text-sm">
                Get results in minutes using our AI-powered analysis engine
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6 hover:border-[#111111] dark:hover:border-white hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F3F4F6] dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#111111] dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">
                Accurate Results
              </h4>
              <p className="text-[#525252] dark:text-[#999999] text-sm">
                Comprehensive damage detection and cost estimation accuracy
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6 hover:border-[#111111] dark:hover:border-white hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#F3F4F6] dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#111111] dark:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">
                Secure Analysis
              </h4>
              <p className="text-[#525252] dark:text-[#999999] text-sm">
                Your data is encrypted and processed securely
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#F0F9FF] dark:bg-[#0F2942] border border-[#3B82F6]/20 dark:border-[#1565C0]/20 rounded-lg p-6">
            <p className="text-[#111111] dark:text-white">
              <span className="font-semibold">Tip:</span> Upload clear,
              well-lit photos of your building facade from different angles for
              the best analysis results.
            </p>
          </div>

          {/* Skip Link */}
          <div className="mt-12 text-center">
            <p className="text-[#525252] mb-4">
              Want to view existing assessments?
            </p>
            <Link
              to="/dashboard"
              className="text-[#111111] font-medium hover:underline"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
