"use client";

import { useEffect, useState } from "react";
import { BASE_URL, JobStatus } from "@/lib/api";

type Props = {
  job: JobStatus | null;
};

function buildLink(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/${path}`;
}

type RiskSummary = {
  job_id: string;
  overall_risk_score?: number;
  overall_severity_index?: number;
  building_health_grade?: string;
  total_damage_count?: number;
  by_type?: Record<
    string,
    {
      count?: number;
      risk_points?: number;
    }
  >;
};

export default function ResultsPanel({ job }: Props) {
  const [riskDetails, setRiskDetails] = useState<RiskSummary | null>(null);
  const [riskError, setRiskError] = useState<string | null>(null);

  const outputs = job?.outputs ?? {};
  const riskOutputPath = outputs.risk;

  useEffect(() => {
    if (!job || job.status !== "completed") {
      setRiskDetails(null);
      setRiskError(null);
      return;
    }
    const riskPath = riskOutputPath;
    const url = riskPath ? buildLink(riskPath) : null;
    if (!url) {
      setRiskDetails(null);
      setRiskError(null);
      return;
    }
    let cancelled = false;
    const encodedUrl = url.replace(/ /g, "%20");
    fetch(encodedUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch risk summary (${res.status})`);
        }
        return res.json();
      })
      .then((data: RiskSummary) => {
        if (!cancelled) {
          setRiskDetails(data);
          setRiskError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setRiskDetails(null);
          setRiskError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [job, riskOutputPath]);

  if (!job) {
    return null;
  }

  const damagesLink = buildLink(outputs.damages);
  const meshLink = buildLink(outputs.mesh);
  const costLink = buildLink(outputs.cost);
  const viewerLink = outputs.viewer_url;
  const pdfLink = `${BASE_URL}/jobs/${job.job_id}/report.pdf`;

  const showRiskSummary =
    job.status === "completed" &&
    (job.overall_risk_score !== undefined ||
      job.overall_severity_index !== undefined ||
      job.building_health_grade ||
      riskDetails);

  return (
    <div className="space-y-6">
      {/* Uploaded Files Card */}
      <div className="card overflow-hidden">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h3 className="text-sm font-medium text-neutral-50">Uploaded Files</h3>
        </div>
        <div className="p-6">
          {job.uploaded_files?.length ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {job.uploaded_files.map((filename) => (
                <div key={filename} className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-800/50 px-3 py-2 text-sm">
                  <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate text-neutral-300">{filename}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">File metadata unavailable.</p>
          )}
        </div>
      </div>

      {/* Outputs Card */}
      <div className="card overflow-hidden">
        <div className="border-b border-neutral-800 px-6 py-4">
          <h3 className="text-sm font-medium text-neutral-50">Downloads & Outputs</h3>
        </div>
        <div className="p-6">
          {job.status !== "completed" ? (
            <p className="text-sm text-neutral-500">Processing not finished yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* PDF Report */}
              <a
                href={pdfLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-800"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10">
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-50">PDF Report</p>
                  <p className="text-xs text-neutral-500">Full assessment report</p>
                </div>
              </a>

              {/* Damages JSON */}
              {damagesLink && (
                <a
                  href={damagesLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-800"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
                    <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-50">Damages JSON</p>
                    <p className="text-xs text-neutral-500">Raw damage data</p>
                  </div>
                </a>
              )}

              {/* Cost Estimate */}
              {costLink && (
                <a
                  href={costLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-800"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
                    <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-50">Cost Estimate</p>
                    <p className="text-xs text-neutral-500">Repair cost breakdown</p>
                  </div>
                </a>
              )}

              {/* 3D Viewer */}
              {viewerLink && (
                <a
                  href={viewerLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-all hover:border-neutral-700 hover:bg-neutral-800"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-50">3D Viewer</p>
                    <p className="text-xs text-neutral-500">Interactive model</p>
                  </div>
                </a>
              )}
            </div>
          )}

          {/* Engine Info */}
          {job.status === "completed" && (
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-800/50 px-4 py-3">
              <p className="text-xs text-neutral-500">
                <span className="font-medium text-neutral-400">Reconstruction engine:</span>{" "}
                {job.reconstruction_engine ?? "mock (development)"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Summary Card */}
      {showRiskSummary && (
        <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5">
          <div className="border-b border-amber-500/20 px-6 py-4">
            <h3 className="text-sm font-medium text-amber-400">Risk & Building Health Details</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/70">Health Grade</p>
                <p className="mt-1 text-2xl font-bold text-amber-400">
                  {job.building_health_grade ?? riskDetails?.building_health_grade ?? "N/A"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/70">Risk Score</p>
                <p className="mt-1 text-2xl font-bold text-amber-400">
                  {job.overall_risk_score ?? riskDetails?.overall_risk_score ?? "N/A"}
                  <span className="text-base font-normal text-amber-400/60"> / 100</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/70">Severity Index</p>
                <p className="mt-1 text-2xl font-bold text-amber-400">
                  {job.overall_severity_index ?? riskDetails?.overall_severity_index ?? "N/A"}
                  <span className="text-base font-normal text-amber-400/60"> / 10</span>
                </p>
              </div>
            </div>

            {riskDetails?.by_type && Object.keys(riskDetails.by_type).length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/70">Risk by Damage Type</p>
                <div className="mt-3 space-y-2">
                  {Object.entries(riskDetails.by_type).map(([damageType, info]) => (
                    <div key={damageType} className="flex items-center justify-between rounded-lg border border-amber-500/10 bg-amber-500/5 px-4 py-2">
                      <span className="text-sm font-medium capitalize text-amber-400">{damageType.replace(/_/g, " ")}</span>
                      <span className="text-sm text-amber-400/70">
                        {info.count ?? 0} findings · {info.risk_points ?? 0} risk pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {riskError && (
              <p className="mt-4 text-xs text-red-400">{riskError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
