"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useRef } from "react";
import { uploadImages } from "@/lib/api";

export default function UploadForm() {
  const [label, setLabel] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFiles.length) {
      setError("Please choose at least one image.");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const { job_id } = await uploadImages(selectedFiles, label.trim() || undefined);
      router.push(`/results/${job_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);
      setError(`${message}. Check network connectivity and backend status.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) setSelectedFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Label Input */}
      <div>
        <label htmlFor="label" className="block text-sm font-medium text-neutral-300">
          Assessment Label
          <span className="ml-1 text-neutral-500">(optional)</span>
        </label>
        <input
          id="label"
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="e.g. Midtown Tower – East façade"
          className="mt-2 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm text-neutral-50 placeholder:text-neutral-500 transition-colors focus:border-neutral-600 focus:bg-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-600"
        />
        <p className="mt-1.5 text-xs text-neutral-500">Helps you identify this assessment later.</p>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-300">Façade Photos</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-all ${
            isDragging
              ? "border-neutral-500 bg-neutral-800"
              : selectedFiles.length > 0
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-neutral-700 bg-neutral-800/50 hover:border-neutral-600 hover:bg-neutral-800"
          }`}
        >
          {selectedFiles.length > 0 ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-emerald-400">{selectedFiles.length} file(s) selected</p>
              <p className="mt-1 text-xs text-neutral-500">Click to change selection</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800">
                <svg className="h-6 w-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-neutral-300">Drop files here or click to browse</p>
              <p className="mt-1 text-xs text-neutral-500">PNG, JPG, JPEG up to 10MB each</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              const files = event.target.files ? Array.from(event.target.files) : [];
              setSelectedFiles(files);
            }}
          />
        </div>
      </div>

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Selected files</p>
          <ul className="mt-3 space-y-2">
            {selectedFiles.slice(0, 5).map((file, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="truncate">{file.name}</span>
                <span className="ml-auto text-xs text-neutral-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </li>
            ))}
            {selectedFiles.length > 5 && (
              <li className="text-xs text-neutral-500">…and {selectedFiles.length - 5} more files</li>
            )}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">Upload failed</p>
              <p className="mt-0.5 text-sm text-red-400/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || selectedFiles.length === 0}
        className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500 disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Uploading…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload and Continue
          </>
        )}
      </button>
    </form>
  );
}
