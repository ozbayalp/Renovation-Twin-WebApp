"use client";

import { useCallback, useEffect, useState } from "react";
import StatusDisplay from "@/components/StatusDisplay";
import ProcessingButton from "@/components/ProcessingButton";
import ResultsPanel from "@/components/ResultsPanel";
import ErrorLog from "@/components/ErrorLog";
import type { JobStatus } from "@/lib/api";
import { getJobStatus } from "@/lib/api";

type Props = {
  jobId: string;
};

const POLL_INTERVAL_MS = 5000;

// Vercel dark theme status configuration
const statusConfig: Record<JobStatus["status"], { bg: string; text: string; dot: string }> = {
  uploaded: { bg: "bg-neutral-500/10", text: "text-neutral-400", dot: "bg-neutral-400" },
  processing: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  failed: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" }
};

const gradeConfig: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  B: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  C: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  D: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" }
};

function buildLink(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return path;
  }
  return path;
}

function StatusBadge({ status }: { status: JobStatus["status"] }) {
  const config = statusConfig[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}

function HealthGradeCard({ grade }: { grade?: string | null }) {
  if (!grade) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800 text-2xl font-bold text-neutral-500">
        —
      </div>
    );
  }
  const config = gradeConfig[grade] ?? { bg: "bg-neutral-800", text: "text-neutral-400", border: "border-neutral-700" };
  return (
    <div className={`flex h-16 w-16 items-center justify-center rounded-xl border ${config.bg} ${config.text} ${config.border}`}>
      <span className="text-2xl font-bold">{grade}</span>
    </div>
  );
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { 
    month: "long", 
    day: "numeric", 
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default function ResultsClient({ jobId }: Props) {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const pushLog = useCallback((message: string) => {
    setLogs((prev) => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${message}`]);
    console.error(message);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      setIsFetching(true);
      const status = await getJobStatus(jobId);
      setJob(status);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job.");
      pushLog(`Status fetch error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsFetching(false);
    }
  }, [jobId, pushLog]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") {
      return;
    }
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [job, fetchStatus]);

  useEffect(() => {
    if (!job || job.status === "completed" || job.status === "failed") {
      setProgress(job?.status === "completed" ? 100 : 0);
      return;
    }
    setProgress(10);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 10;
        }
        return prev + 5;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [job]);

  return (
    <div className="space-y-6">
      {/* Summary Overview Card */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="border-b border-neutral-800 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Assessment</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-neutral-50">
                {job?.label || `Assessment ${jobId.slice(0, 8)}…`}
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Created {formatDate(job?.created_at)} · {job?.uploaded_files?.length ?? 0} photos
              </p>
            </div>
            {job?.status && <StatusBadge status={job.status} />}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid divide-y divide-neutral-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          {/* Health Grade */}
          <div className="flex items-center gap-4 px-6 py-5">
            <HealthGradeCard grade={job?.building_health_grade} />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Health Grade</p>
              <p className="mt-1 text-sm text-neutral-400">
                {job?.building_health_grade 
                  ? `Grade ${job.building_health_grade}` 
                  : "Pending analysis"}
              </p>
            </div>
          </div>

          {/* Risk Score */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Risk Score</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-50">
              {job?.overall_risk_score !== undefined && job?.overall_risk_score !== null 
                ? job.overall_risk_score 
                : "—"}
              <span className="ml-1 text-base font-normal text-neutral-600">/ 100</span>
            </p>
          </div>

          {/* Severity Index */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Severity Index</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-50">
              {job?.overall_severity_index !== undefined && job?.overall_severity_index !== null 
                ? job.overall_severity_index 
                : "—"}
              <span className="ml-1 text-base font-normal text-neutral-600">/ 10</span>
            </p>
          </div>

          {/* Estimated Cost */}
          <div className="px-6 py-5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Est. Repair Cost</p>
            {job?.outputs?.cost ? (
              <a
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-neutral-50 underline decoration-neutral-600 underline-offset-2 transition-colors hover:text-white hover:decoration-neutral-400"
                href={buildLink(job.outputs.cost) ?? job.outputs.cost}
                target="_blank"
                rel="noreferrer"
              >
                View estimate
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-600">—</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-neutral-800 px-6 py-3">
          <button
            type="button"
            onClick={fetchStatus}
            disabled={isFetching}
            className="btn-secondary inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <svg className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => setLogs([])}
              className="btn-secondary"
            >
              Clear log
            </button>
          )}
        </div>
      </div>

      <StatusDisplay status={job?.status} error={error || job?.error} />

      {/* Processing Progress */}
      {job && job.status !== "completed" && job.status !== "failed" && (
        <div className="card overflow-hidden p-5">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin text-neutral-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-50">Processing your assessment…</p>
              <p className="text-xs text-neutral-500">AI analysis may take a moment</p>
            </div>
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-neutral-800">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Processing Button */}
      {job?.status === "uploaded" && (
        <ProcessingButton
          jobId={job.job_id}
          onLog={pushLog}
          onProcessed={() => {
            setJob((prev) => (prev ? { ...prev, status: "processing" } : prev));
            fetchStatus();
          }}
        />
      )}

      {/* Failed State */}
      {job?.status === "failed" && (
        <div className="overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10">
          <div className="flex items-start gap-3 p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-400">Processing failed</h3>
              <p className="mt-1 text-sm text-red-400/80">
                {job.error || "An unexpected error occurred. Please check the backend logs and try again."}
              </p>
            </div>
          </div>
        </div>
      )}

      <ResultsPanel job={job} />

      <ErrorLog logs={logs} />
    </div>
  );
}
