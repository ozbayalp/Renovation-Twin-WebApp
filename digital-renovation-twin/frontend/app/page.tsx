"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { JobSummary } from "@/lib/api";
import { listJobs } from "@/lib/api";

// Vercel-style dark theme status configuration
const statusConfig: Record<JobSummary["status"], { bg: string; text: string; dot: string }> = {
  uploaded: { bg: "bg-neutral-500/10", text: "text-neutral-400", dot: "bg-neutral-400" },
  processing: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  failed: { bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" }
};

const gradeColors: Record<string, string> = {
  A: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  B: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  C: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  D: "text-red-400 bg-red-500/10 border-red-500/20"
};

function StatusPill({ status }: { status: JobSummary["status"] }) {
  const config = statusConfig[status];
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
}

function GradeBadge({ grade }: { grade?: string | null }) {
  if (!grade) return <span className="text-neutral-600">—</span>;
  const colors = gradeColors[grade] ?? "text-neutral-400 bg-neutral-500/10 border-neutral-500/20";
  return (
    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-bold ${colors}`}>
      {grade}
    </span>
  );
}

function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const response = await listJobs();
        if (!cancelled) {
          setJobs(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load assessments.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchJobs();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">Dashboard</h1>
          <p className="mt-2 text-sm text-neutral-400">Recent façade risk assessments and their health grades.</p>
        </div>
        <Link href="/upload" className="btn-primary inline-flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Assessment
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-neutral-400">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Loading assessments…</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-400">Failed to load assessments</h3>
                  <p className="mt-1 text-sm text-red-400/80">{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900">
              <svg className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-neutral-50">No assessments yet</h3>
            <p className="mt-1 text-sm text-neutral-500">Get started by creating your first façade assessment.</p>
            <Link href="/upload" className="btn-primary mt-6 inline-flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Start a new assessment
            </Link>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Assessment</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Status</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Grade</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Risk Score</th>
                <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-neutral-500">Est. Cost</th>
                <th className="px-6 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-neutral-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {jobs.map((job) => (
                <tr key={job.job_id} className="table-row group">
                  <td className="px-6 py-4">
                    <Link href={`/results/${job.job_id}`} className="block">
                      <p className="font-medium text-neutral-50 group-hover:text-white">
                        {job.label || `Assessment ${job.job_id.slice(0, 8)}…`}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">{formatDate(job.created_at)}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={job.status} />
                  </td>
                  <td className="px-6 py-4">
                    <GradeBadge grade={job.building_health_grade} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-300">
                      {job.overall_risk_score !== undefined && job.overall_risk_score !== null
                        ? <><span className="font-medium">{job.overall_risk_score}</span><span className="text-neutral-600"> / 100</span></>
                        : <span className="text-neutral-600">—</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-neutral-50">{formatCurrency(job.total_estimated_cost)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/results/${job.job_id}`}
                      className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-white"
                    >
                      View
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
