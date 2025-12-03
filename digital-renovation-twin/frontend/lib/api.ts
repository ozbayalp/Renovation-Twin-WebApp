export const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

export type JobStatus = {
  job_id: string;
  status: "uploaded" | "processing" | "completed" | "failed";
  label?: string | null;
  created_at?: string | null;
  uploaded_files?: string[];
  error?: string | null;
  reconstruction_engine?: string | null;
  overall_risk_score?: number | null;
  overall_severity_index?: number | null;
  building_health_grade?: string | null;
  outputs?: {
    mesh?: string;
    damages?: string;
    cost?: string;
    risk?: string;
    report?: string;
    viewer_url?: string;
    [key: string]: string | undefined;
  };
};

export type ImageVerificationResult = {
  job_id: string;
  results: Array<{
    filename: string;
    status: "ok" | "error";
    image_type?: string;
    error?: string;
  }>;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    const errorDetails = {
      url: res.url,
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body,
    };
    // Log everything to the console
    console.error("API ERROR", errorDetails);
    throw new Error(
      `API Error: ${res.status} ${res.statusText}\nURL: ${res.url}\nHeaders: ${JSON.stringify(errorDetails.headers, null, 2)}\nBody: ${body}`
    );
  }
  return (await res.json()) as T;
}

export async function uploadImages(files: File[], label?: string): Promise<
  { job_id: string; status: JobStatus["status"]; label?: string | null }
> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (label) {
    formData.append("label", label);
  }

  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    body: formData
  });

  return handleResponse(res);
}

export type JobSummary = {
  job_id: string;
  label?: string | null;
  created_at?: string | null;
  status: JobStatus["status"];
  building_health_grade?: string | null;
  overall_risk_score?: number | null;
  total_estimated_cost?: number | null;
};

export async function listJobs(): Promise<JobSummary[]> {
  const res = await fetch(`${BASE_URL}/jobs`, { cache: "no-store" });
  return handleResponse(res);
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function processJob(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/process`, {
    method: "POST"
  });
  return handleResponse(res);
}

export async function verifyJobImages(jobId: string): Promise<ImageVerificationResult> {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}/verify-images`, {
    method: "POST"
  });
  return handleResponse(res);
}
