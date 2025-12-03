"use client";

import { JobStatus } from "@/lib/api";

type Props = {
  status?: JobStatus["status"];
  error?: string | null;
};

// Vercel dark theme status configuration
const statusConfig: Record<JobStatus["status"], { message: string; icon: string; bg: string; border: string; text: string }> = {
  uploaded: {
    message: "Uploaded – ready to start processing",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    bg: "bg-neutral-500/10",
    border: "border-neutral-500/20",
    text: "text-neutral-400"
  },
  processing: {
    message: "Processing – AI analysis in progress",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400"
  },
  completed: {
    message: "Completed – all outputs are ready",
    icon: "M5 13l4 4L19 7",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400"
  },
  failed: {
    message: "Processing failed",
    icon: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400"
  }
};

export default function StatusDisplay({ status, error }: Props) {
  if (!status) {
    return null;
  }

  const config = statusConfig[status];

  // Don't show status display for processing/uploaded - that's handled elsewhere
  if (status === "processing" || status === "uploaded") {
    return null;
  }

  return (
    <div className={`overflow-hidden rounded-xl border ${config.border} ${config.bg} shadow-sm`}>
      <div className="flex items-start gap-3 p-5">
        <svg className={`h-5 w-5 ${config.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
        </svg>
        <div>
          <p className={`text-sm font-medium ${config.text}`}>{config.message}</p>
          {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
