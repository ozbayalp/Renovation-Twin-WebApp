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
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className="rounded bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500 disabled:bg-slate-400"
      >
        {isProcessing ? "Verifying…" : "Verify & Start Processing"}
      </button>
      {error && (
        <p className="text-sm text-rose-600">
          {error} (See detailed log below for context.)
        </p>
      )}
      {verification && (
        <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-medium">Image verification results:</p>
          <ul className="mt-2 space-y-1">
            {verification.results.map((entry) => (
              <li key={entry.filename} className={entry.status === "ok" ? "text-emerald-700" : "text-rose-600"}>
                {entry.filename} &mdash; {entry.status === "ok" ? entry.image_type ?? "ok" : entry.error ?? "error"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
