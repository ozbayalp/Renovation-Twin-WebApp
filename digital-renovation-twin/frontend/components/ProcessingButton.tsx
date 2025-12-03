"use client";

import { useState } from "react";
import { ImageVerificationResult, processJob, verifyJobImages } from "@/lib/api";

type Props = {
  jobId: string;
  disabled?: boolean;
  onProcessed?: () => void;
  onLog?: (message: string) => void;
};

const hasVerificationErrors = (verification: ImageVerificationResult | null) =>
  Boolean(verification?.results.some((entry) => entry.status !== "ok"));

export default function ProcessingButton({ jobId, disabled, onProcessed, onLog }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<ImageVerificationResult | null>(null);

  const handleClick = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setVerification(null);

      onLog?.(`Verifying images for job ${jobId}...`);
      const verificationResult = await verifyJobImages(jobId);
      setVerification(verificationResult);
      onLog?.(`Verification complete: ${verificationResult.results.length} files checked.`);

      if (hasVerificationErrors(verificationResult)) {
        setError("Some images failed validation. Please re-upload valid façade photos.");
        onLog?.("Verification failed. Inspect the file list above for details.");
        return;
      }

      await processJob(jobId);
      onLog?.("Processing started successfully.");
      onProcessed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed");
      onLog?.(`Processing error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800">
            <svg className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-neutral-50">Ready to process</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Click below to verify images and start the AI analysis pipeline.
            </p>
            <button
              type="button"
              onClick={handleClick}
              disabled={disabled || isProcessing}
              className="btn-primary mt-4 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-500 disabled:hover:scale-100"
            >
              {isProcessing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying images…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Verify & Start Processing
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-t border-red-500/20 bg-red-500/10 px-6 py-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Verification Results */}
      {verification && (
        <div className="border-t border-neutral-800 px-6 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Image verification</p>
          <ul className="mt-3 space-y-2">
            {verification.results.map((entry) => (
              <li key={entry.filename} className="flex items-center gap-2 text-sm">
                {entry.status === "ok" ? (
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className={entry.status === "ok" ? "text-neutral-300" : "text-red-400"}>
                  {entry.filename}
                </span>
                <span className="text-neutral-600">—</span>
                <span className={entry.status === "ok" ? "text-emerald-400" : "text-red-400"}>
                  {entry.status === "ok" ? entry.image_type ?? "Valid" : entry.error ?? "Error"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
