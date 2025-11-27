"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { uploadImages } from "@/lib/api";

export default function UploadForm() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const { job_id } = await uploadImages(selectedFiles);
      router.push(`/results/${job_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", err);
      setError(`${message}. Check network connectivity and backend status.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm">
      <label className="text-sm font-medium text-slate-700">
        Upload façade photos
        <input
          type="file"
          accept="image/*"
          multiple
          className="mt-2 block w-full rounded border border-slate-300 p-2"
          onChange={(event) => {
            const files = event.target.files ? Array.from(event.target.files) : [];
            setSelectedFiles(files);
          }}
        />
      </label>
      {selectedFiles.length > 0 && (
        <p className="text-sm text-slate-600">{selectedFiles.length} file(s) selected.</p>
      )}

      {error && (
        <p className="text-sm text-rose-600">
          {error} (See browser console for stack trace.)
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500 disabled:bg-slate-400"
      >
        {isSubmitting ? "Uploading..." : "Upload and Continue"}
      </button>
    </form>
  );
}
