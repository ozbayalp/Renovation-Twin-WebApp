/**
 * API Client for FastAPI Backend
 * Handles all communication with the Façade Risk Analyzer backend
 */

import { getApiKeyHeaders } from "./apiKey";

// Backend URL - empty string uses relative URLs (proxied by Vite in dev)
// In production, set VITE_API_BASE_URL to the actual backend URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// ============ Types ============

export interface JobOutputs {
  mesh?: string | null;
  damages?: string | null;
  cost?: string | null;
  risk?: string | null;
  report?: string | null;
  viewer_url?: string | null;
  reconstruction_job?: string | null;
  reconstruction_engine?: string | null;
  reconstruction_workspace?: string | null;
  asset_url?: string | null;
  asset_local_path?: string | null;
  reconstruction_error?: string | null;
}

export interface JobStatus {
  job_id: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  label?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  uploaded_files?: string[];
  outputs?: JobOutputs;
  error?: string | null;
  overall_risk_score?: number | null;
  overall_severity_index?: number | null;
  building_health_grade?: string | null;
  reconstruction_engine?: string | null;
}

export interface UploadResponse {
  job_id: string;
  status: string;
  uploaded_files: string[];
  label?: string;
}

export interface ImageVerificationEntry {
  filename: string;
  status: "ok" | "error";
  image_type?: string | null;
  error?: string | null;
}

export interface ImageVerificationResult {
  job_id: string;
  results: ImageVerificationEntry[];
}

export interface RiskSummary {
  job_id: string;
  overall_risk_score?: number;
  overall_severity_index?: number;
  building_health_grade?: string;
  total_damage_count?: number;
  by_type?: Record<string, { count?: number; risk_points?: number }>;
}

// ============ API Functions ============

/**
 * Upload images for a new job
 */
export async function uploadImages(
  files: File[],
  label?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  if (label) {
    formData.append("label", label);
  }

  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Upload failed");
  }

  return response.json();
}

/**
 * Get job status by ID
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Job not found");
    }
    const error = await response.json().catch(() => ({ detail: "Failed to fetch job" }));
    throw new Error(error.detail || "Failed to fetch job status");
  }

  return response.json();
}

/**
 * Get all jobs (list endpoint)
 */
export async function getAllJobs(): Promise<JobStatus[]> {
  const response = await fetch(`${API_BASE_URL}/jobs`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to fetch jobs" }));
    throw new Error(error.detail || "Failed to fetch jobs");
  }

  return response.json();
}

/**
 * Verify uploaded images before processing
 */
export async function verifyJobImages(jobId: string): Promise<ImageVerificationResult> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/verify-images`, {
    method: "POST",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Verification failed" }));
    throw new Error(error.detail || "Image verification failed");
  }

  return response.json();
}

/**
 * Start processing a job
 * Includes OpenAI API key in headers if available for AI features
 */
export async function processJob(jobId: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/process`, {
    method: "POST",
    headers: {
      ...getApiKeyHeaders(),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Processing failed" }));
    throw new Error(error.detail || "Failed to start processing");
  }

  return response.json();
}

/**
 * Get PDF report URL
 */
export function getReportUrl(jobId: string): string {
  return `${API_BASE_URL}/jobs/${jobId}/report.pdf`;
}

/**
 * Build full URL for output paths
 */
export function buildOutputUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}

/**
 * Fetch risk summary JSON
 */
export async function fetchRiskSummary(riskPath: string): Promise<RiskSummary> {
  const url = buildOutputUrl(riskPath);
  if (!url) throw new Error("Invalid risk path");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch risk summary");
  }

  return response.json();
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("Backend is not healthy");
  }
  return response.json();
}

/**
 * Rename a job (update its label)
 */
export async function renameJob(jobId: string, label: string): Promise<JobStatus> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}?label=${encodeURIComponent(label)}`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Rename failed" }));
    throw new Error(error.detail || "Failed to rename job");
  }

  return response.json();
}

/**
 * Delete a job
 */
export async function deleteJob(jobId: string): Promise<{ message: string; job_id: string }> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Delete failed" }));
    throw new Error(error.detail || "Failed to delete job");
  }

  return response.json();
}

/**
 * Delete all jobs
 */
export async function deleteAllJobs(): Promise<{ message: string; deleted_count: number }> {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Clear all failed" }));
    throw new Error(error.detail || "Failed to clear all jobs");
  }

  return response.json();
}
