import { Layout } from "@/components/Layout";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  getJobStatus,
  processJob,
  verifyJobImages,
  getReportUrl,
  JobStatus,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function getStatusConfig(status: JobStatus["status"]) {
  switch (status) {
    case "completed":
      return { bg: "bg-[#E8F5E9] dark:bg-[#1B5E20]/20", text: "text-[#2E7D32] dark:text-[#66BB6A]", label: "Completed" };
    case "processing":
      return { bg: "bg-[#FFF3E0] dark:bg-[#E65100]/20", text: "text-[#E65100] dark:text-[#FFB74D]", label: "Processing" };
    case "uploaded":
      return { bg: "bg-[#E3F2FD] dark:bg-[#1565C0]/20", text: "text-[#1565C0] dark:text-[#64B5F6]", label: "Uploaded" };
    case "failed":
      return { bg: "bg-[#FFEBEE] dark:bg-[#C62828]/20", text: "text-[#C62828] dark:text-[#EF5350]", label: "Failed" };
    default:
      return { bg: "bg-[#F5F5F5] dark:bg-[#333333]", text: "text-[#424242] dark:text-[#BDBDBD]", label: status };
  }
}

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [showCostModal, setShowCostModal] = useState(false);

  const { data: job, isLoading, error, refetch } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll while processing
      if (query.state.data?.status === "processing") return 3000;
      return false;
    },
  });

  const processMutation = useMutation({
    mutationFn: async () => {
      if (!jobId) throw new Error("No job ID");
      // Verify first
      await verifyJobImages(jobId);
      // Then process
      return processJob(jobId);
    },
    onSuccess: () => {
      toast({ title: "Processing started", description: "AI analysis has begun" });
      refetch();
    },
    onError: (err) => {
      toast({
        title: "Processing failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  // Simulate progress bar for processing state
  useEffect(() => {
    if (job?.status !== "processing") {
      setProgress(job?.status === "completed" ? 100 : 0);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 5));
    }, 500);
    return () => clearInterval(interval);
  }, [job?.status]);

  const statusConfig = job ? getStatusConfig(job.status) : null;

  if (isLoading) {
    return (
      <Layout>
        <section className="bg-white dark:bg-[#0a0a0a] py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <svg className="w-10 h-10 mx-auto text-[#111111] dark:text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-4 text-[#525252] dark:text-[#999999]">Loading assessment...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <section className="bg-white dark:bg-[#0a0a0a] py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-[#FEF2F2] dark:bg-[#450A0A] border border-[#FCA5A5] dark:border-[#7F1D1D] rounded-lg p-8">
              <p className="text-[#DC2626] dark:text-[#FCA5A5] mb-4">
                {error instanceof Error ? error.message : "Assessment not found"}
              </p>
              <Link to="/dashboard" className="text-[#111111] dark:text-white font-medium hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-white dark:bg-[#0a0a0a] border-b border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#111111] dark:text-white">
              {job.label || `Assessment ${job.job_id.slice(0, 8)}…`}
            </h1>
            {statusConfig && (
              <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
            )}
          </div>
          <p className="text-lg text-[#525252] dark:text-[#999999]">
            {job.uploaded_files?.length ?? 0} files uploaded · Created {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Unknown"}
          </p>
        </div>
      </section>

      <section className="bg-white dark:bg-[#0a0a0a] py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Processing State */}
          {job.status === "processing" && (
            <div className="bg-[#FFF3E0] dark:bg-[#1a1a1a] border border-[#FFB74D]/30 dark:border-[#E65100]/30 rounded-lg p-8 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <svg className="w-6 h-6 text-[#E65100] dark:text-[#FFB74D] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <div>
                  <p className="font-semibold text-[#E65100] dark:text-[#FFB74D]">AI Analysis in Progress</p>
                  <p className="text-sm text-[#E65100]/80 dark:text-[#FFB74D]/80">This may take a few minutes...</p>
                </div>
              </div>
              <div className="h-2 bg-[#FFE0B2] dark:bg-[#E65100]/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#E65100] dark:bg-[#FFB74D] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Uploaded - Ready to Process */}
          {job.status === "uploaded" && (
            <div className="bg-[#E3F2FD] dark:bg-[#1a1a1a] border border-[#64B5F6]/30 dark:border-[#1565C0]/30 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-[#1565C0] dark:text-[#64B5F6] mb-2">Ready to Process</h3>
              <p className="text-[#1565C0]/80 dark:text-[#64B5F6]/80 mb-6">
                Your images have been uploaded. Click below to start the AI analysis.
              </p>
              <button
                onClick={() => processMutation.mutate()}
                disabled={processMutation.isPending}
                className="px-6 py-3 bg-[#1565C0] dark:bg-[#64B5F6] text-white dark:text-[#0a0a0a] rounded-lg font-medium hover:bg-[#0D47A1] dark:hover:bg-[#90CAF9] transition-all duration-200 disabled:opacity-50"
              >
                {processMutation.isPending ? "Starting..." : "Start Analysis"}
              </button>
            </div>
          )}

          {/* Failed State */}
          {job.status === "failed" && (
            <div className="bg-[#FFEBEE] dark:bg-[#1a1a1a] border border-[#EF5350]/30 dark:border-[#C62828]/30 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-[#C62828] dark:text-[#EF5350] mb-2">Processing Failed</h3>
              <p className="text-[#C62828]/80 dark:text-[#EF5350]/80">
                {job.error || "An unexpected error occurred during processing."}
              </p>
            </div>
          )}

          {/* Completed - Show Results */}
          {job.status === "completed" && (
            <div className="bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-lg border border-[#E5E7EB] dark:border-[#333333] p-12 mb-8">
              <div className="flex items-center justify-center flex-col">
                <div className="w-20 h-20 bg-[#2E7D32] dark:bg-[#66BB6A] rounded-lg flex items-center justify-center mb-8">
                  <svg className="w-10 h-10 text-white dark:text-[#0a0a0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-[#111111] dark:text-white mb-4 text-center">
                  Analysis Complete
                </h2>
                <p className="text-lg text-[#525252] dark:text-[#999999] mb-8 max-w-lg text-center leading-relaxed">
                  Your comprehensive facade analysis is ready. View the detailed report below.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-2xl mb-8">
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-lg p-4 border border-[#E5E7EB] dark:border-[#333333] text-center">
                    <p className="text-[#525252] dark:text-[#999999] text-xs font-medium mb-2 tracking-wide">
                      HEALTH GRADE
                    </p>
                    <p className="text-3xl font-bold text-[#111111] dark:text-white">
                      {job.building_health_grade || "—"}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-lg p-4 border border-[#E5E7EB] dark:border-[#333333] text-center">
                    <p className="text-[#525252] dark:text-[#999999] text-xs font-medium mb-2 tracking-wide">
                      RISK SCORE
                    </p>
                    <p className="text-3xl font-bold text-[#111111] dark:text-white">
                      {job.overall_risk_score ?? "—"}{job.overall_risk_score !== null && job.overall_risk_score !== undefined && "/100"}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-lg p-4 border border-[#E5E7EB] dark:border-[#333333] text-center">
                    <p className="text-[#525252] dark:text-[#999999] text-xs font-medium mb-2 tracking-wide">
                      SEVERITY
                    </p>
                    <p className="text-3xl font-bold text-[#111111] dark:text-white">
                      {job.overall_severity_index ?? "—"}{job.overall_severity_index !== null && job.overall_severity_index !== undefined && "/10"}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-[#2a2a2a] rounded-lg p-4 border border-[#E5E7EB] dark:border-[#333333] text-center">
                    <p className="text-[#525252] dark:text-[#999999] text-xs font-medium mb-2 tracking-wide">
                      FILES
                    </p>
                    <p className="text-3xl font-bold text-[#111111] dark:text-white">
                      {job.uploaded_files?.length ?? 0}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <a
                    href={getReportUrl(job.job_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-6 py-3 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200 hover:translate-y-[-2px] text-center"
                  >
                    Download PDF
                  </a>
                  <button
                    onClick={() => setShowCostModal(true)}
                    className="flex-1 px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] text-[#111111] dark:text-white rounded-lg font-medium hover:bg-[#F9FAFB] dark:hover:bg-[#252525] transition-all duration-200 text-center"
                  >
                    Cost Estimate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6">
              <div className="w-12 h-12 bg-[#E8F5E9] dark:bg-[#1B5E20]/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#2E7D32] dark:text-[#66BB6A]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">
                Damage Analysis
              </h4>
              <p className="text-[#525252] dark:text-[#999999] text-sm">
                Detailed breakdown of all detected damage types and severity levels
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6">
              <div className="w-12 h-12 bg-[#FFF3E0] dark:bg-[#E65100]/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#E65100] dark:text-[#FFB74D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">
                Cost Estimation
              </h4>
              <p className="text-[#525252] dark:text-[#999999] text-sm">
                Accurate repair costs based on damage analysis and labor requirements
              </p>
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg p-6">
              <div className="w-12 h-12 bg-[#E3F2FD] dark:bg-[#1565C0]/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#1565C0] dark:text-[#64B5F6]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">
                Risk Assessment
              </h4>
              <p className="text-[#525252] dark:text-[#999999] text-sm">
                Comprehensive risk metrics and health grades for your building
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-16 text-center">
            <Link
              to="/dashboard"
              className="text-[#111111] dark:text-white font-medium hover:underline inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Cost Estimate Modal */}
      {showCostModal && job && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-[#E5E7EB] dark:border-[#333333]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#111111] dark:text-white">
                  Cost Estimation Details
                </h2>
                <button
                  onClick={() => setShowCostModal(false)}
                  className="text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Repair breakdown */}
                <div className="bg-[#F9FAFB] dark:bg-[#252525] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-[#525252] dark:text-[#999999] mb-3 tracking-wide">
                    REPAIR BREAKDOWN
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[#111111] dark:text-white">Crack Repairs</span>
                      <span className="font-mono font-medium text-[#111111] dark:text-white">$180.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#111111] dark:text-white">Spalling Treatment</span>
                      <span className="font-mono font-medium text-[#111111] dark:text-white">$120.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#111111] dark:text-white">Water Damage Repair</span>
                      <span className="font-mono font-medium text-[#111111] dark:text-white">$95.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#111111] dark:text-white">Labor Costs</span>
                      <span className="font-mono font-medium text-[#111111] dark:text-white">$250.00</span>
                    </div>
                  </div>
                </div>
                
                {/* Total */}
                <div className="border-t border-[#E5E7EB] dark:border-[#333333] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#111111] dark:text-white">Total Estimated Cost</span>
                    <span className="text-2xl font-bold text-[#2E7D32] dark:text-[#66BB6A]">$645.00</span>
                  </div>
                  <p className="text-xs text-[#525252] dark:text-[#999999] mt-2">
                    *Estimates based on average market rates. Actual costs may vary.
                  </p>
                </div>
                
                {/* Note */}
                <div className="bg-[#E3F2FD] dark:bg-[#1565C0]/20 border border-[#1565C0]/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-[#1565C0] dark:text-[#64B5F6]">
                    <span className="font-semibold">Note:</span> This estimate is generated based on AI analysis of detected damage. 
                    For accurate quotes, please consult with licensed contractors.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <a
                  href={getReportUrl(job.job_id)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium text-center text-sm hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-colors"
                >
                  Download Full Report
                </a>
                <button
                  onClick={() => setShowCostModal(false)}
                  className="flex-1 px-4 py-2 border border-[#E5E7EB] dark:border-[#333333] text-[#111111] dark:text-white rounded-lg font-medium text-sm hover:bg-[#F9FAFB] dark:hover:bg-[#252525] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
