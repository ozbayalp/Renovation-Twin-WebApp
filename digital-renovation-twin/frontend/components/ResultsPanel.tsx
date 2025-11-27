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
    <section className="space-y-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Uploaded files</h3>
        {job.uploaded_files?.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {job.uploaded_files.map((filename) => (
              <li key={filename}>{filename}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">File metadata unavailable.</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">Outputs</h3>
        {job.status !== "completed" ? (
          <p className="text-sm text-slate-600">Processing not finished yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <span className="font-medium">Damages JSON:</span>{" "}
              {damagesLink ? (
                <a className="text-blue-600 underline" href={damagesLink} target="_blank" rel="noreferrer">
                  Download
                </a>
              ) : (
                <code>{outputs.damages ?? "Not available"}</code>
              )}
            </li>
            <li>
              <span className="font-medium">Cost estimate:</span>{" "}
              {costLink ? (
                <a className="text-blue-600 underline" href={costLink} target="_blank" rel="noreferrer">
                  Download
                </a>
              ) : (
                <code>{outputs.cost ?? "Not available"}</code>
              )}
            </li>
            <li>
              <span className="font-medium">Mesh:</span>{" "}
              {meshLink ? (
                <a className="text-blue-600 underline" href={meshLink} target="_blank" rel="noreferrer">
                  Download
                </a>
              ) : (
                <code>{outputs.mesh ?? "Not available"}</code>
              )}
            </li>
            <li>
              <span className="font-medium">Report PDF:</span>{" "}
              <a className="text-blue-600 underline" href={pdfLink} target="_blank" rel="noreferrer">
                Download report
              </a>
            </li>
            <li>
              <span className="font-medium">3D Viewer:</span>{" "}
              {viewerLink ? (
                <a className="text-blue-600 underline" href={viewerLink} target="_blank" rel="noreferrer">
                  Open hosted viewer
                </a>
              ) : (
                "Unavailable (using placeholder mesh)"
              )}
            </li>
            <li>
              <span className="font-medium">3D Engine:</span>{" "}
              {job.reconstruction_engine
                ? `engine: ${job.reconstruction_engine}`
                : "development placeholder (engine: mock)"}
            </li>
          </ul>
        )}
      </div>

      {showRiskSummary && (
        <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-sm text-slate-800">
          <h3 className="text-base font-semibold text-amber-900">Risk & Building Health</h3>
          <ul className="mt-2 space-y-1">
            <li>
              <span className="font-medium">Building health grade:</span>{" "}
              {job.building_health_grade ?? riskDetails?.building_health_grade ?? "N/A"}
            </li>
            <li>
              <span className="font-medium">Overall risk score:</span>{" "}
              {job.overall_risk_score ?? riskDetails?.overall_risk_score ?? "N/A"} / 100
            </li>
            <li>
              <span className="font-medium">Severity index:</span>{" "}
              {job.overall_severity_index ?? riskDetails?.overall_severity_index ?? "N/A"} / 10
            </li>
          </ul>
          {riskDetails?.by_type && (
            <div className="mt-3">
              <p className="font-medium text-amber-900">Risk by damage type:</p>
              <ul className="mt-1 space-y-1 pl-4">
                {Object.entries(riskDetails.by_type).map(([damageType, info]) => (
                  <li key={damageType}>
                    {damageType}: {info.count ?? 0} findings, risk points {info.risk_points ?? 0}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {riskError && <p className="mt-2 text-xs text-rose-600">{riskError}</p>}
        </div>
      )}
    </section>
  );
}
