"use client";

import { JobStatus } from "@/lib/api";

type Props = {
  status?: JobStatus["status"];
  error?: string | null;
};

const statusCopy: Record<JobStatus["status"], string> = {
  uploaded: "Uploaded – ready to start processing.",
  processing: "Processing – COLMAP + AI damage detection running.",
  completed: "Completed – outputs available below.",
  failed: "Processing failed. Check the error and try again."
};

const statusColor: Record<JobStatus["status"], string> = {
  uploaded: "text-slate-700",
  processing: "text-amber-600",
  completed: "text-emerald-600",
  failed: "text-rose-600"
};

export default function StatusDisplay({ status, error }: Props) {
  if (!status) {
    return <p className="text-slate-500">Fetching job status…</p>;
  }
  return (
    <div className={`rounded-md border border-slate-200 bg-white p-4 ${statusColor[status]}`}>
      <p className="text-base font-medium">{statusCopy[status]}</p>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
