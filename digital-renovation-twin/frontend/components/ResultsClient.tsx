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
      <div className="rounded-md bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Job {jobId}</h2>
            <p className="text-sm text-slate-600">Track processing progress and download outputs.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchStatus}
              className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setLogs([])}
              className="rounded border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
            >
              Clear log
            </button>
          </div>
        </div>
      </div>

      <StatusDisplay status={job?.status} error={error || job?.error} />

      {isFetching && <p className="text-sm text-slate-500">Checking status…</p>}
      {job && job.status !== "completed" && job.status !== "failed" && (
        <div className="space-y-1 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
          <p>Processing… AI analysis can take a moment.</p>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

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

      {job?.status === "failed" && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Processing failed. Please check the backend logs and try again.
        </div>
      )}

      <ResultsPanel job={job} />

      <ErrorLog logs={logs} />
    </div>
  );
}
