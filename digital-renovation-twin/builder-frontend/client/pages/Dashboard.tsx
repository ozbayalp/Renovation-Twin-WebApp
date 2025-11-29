import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllJobs, renameJob, deleteJob, deleteAllJobs, JobStatus } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Status is now plain text, no coloring needed

function getHealthGradeBoxColor(grade: string | null | undefined): string {
  switch (grade) {
    case "A":
      return "bg-[#2E7D32] dark:bg-[#66BB6A]";
    case "B":
      return "bg-[#1565C0] dark:bg-[#64B5F6]";
    case "C":
      return "bg-[#E65100] dark:bg-[#FFB74D]";
    case "D":
      return "bg-[#C62828] dark:bg-[#EF5350]";
    default:
      return "bg-[#9CA3AF] dark:bg-[#666666]";
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameJobId, setRenameJobId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ["jobs"],
    queryFn: getAllJobs,
  });

  // Mutations
  const renameMutation = useMutation({
    mutationFn: ({ jobId, label }: { jobId: string; label: string }) => renameJob(jobId, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Renamed successfully" });
      setRenameDialogOpen(false);
      setRenameJobId(null);
      setRenameValue("");
    },
    onError: (err) => {
      toast({ title: "Failed to rename", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Deleted successfully" });
    },
    onError: (err) => {
      toast({ title: "Failed to delete", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => deleteAllJobs(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({ title: "Cleared all assessments", description: `${data.deleted_count} assessment(s) removed` });
    },
    onError: (err) => {
      toast({ title: "Failed to clear", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    },
  });

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete ALL assessments? This action cannot be undone.")) {
      clearAllMutation.mutate();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRenameClick = (job: JobStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameJobId(job.job_id);
    setRenameValue(job.label || "");
    setRenameDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
      deleteMutation.mutate(jobId);
    }
    setOpenMenuId(null);
  };

  const handleRenameSubmit = () => {
    if (renameJobId && renameValue.trim()) {
      renameMutation.mutate({ jobId: renameJobId, label: renameValue.trim() });
    }
  };

  const isEmpty = !jobs || jobs.length === 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-white dark:bg-[#0a0a0a] border-b border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-[#111111] dark:text-white mb-4">
                All Assessments
              </h1>
              <p className="text-lg text-[#525252] dark:text-[#999999]">
                View and manage all your building facade analyses in one place.
                Track progress, access reports, and monitor risk levels.
              </p>
            </div>
            {!isEmpty && (
              <button
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] dark:border-[#333333] rounded-lg text-sm font-medium text-[#525252] dark:text-[#999999] hover:text-[#DC2626] hover:border-[#DC2626] dark:hover:text-[#EF4444] dark:hover:border-[#EF4444] transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {clearAllMutation.isPending ? "Clearing..." : "Clear All"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <svg
                className="w-10 h-10 text-[#111111] dark:text-white animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-4 text-[#525252] dark:text-[#999999]">Loading assessments...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-24 bg-[#FEF2F2] dark:bg-[#450A0A] rounded-lg border border-[#FCA5A5] dark:border-[#7F1D1D]">
              <p className="text-[#DC2626] dark:text-[#FCA5A5] mb-4">
                Failed to load assessments: {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && isEmpty && (
            <div className="flex flex-col items-center justify-center py-24 bg-[#F9FAFB] dark:bg-[#1a1a1a] rounded-lg border border-[#E5E7EB] dark:border-[#333333]">
              <div className="w-16 h-16 bg-[#F3F4F6] dark:bg-[#2a2a2a] rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-8 h-8 text-[#525252] dark:text-[#999999]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#111111] dark:text-white mb-2">
                No assessments yet
              </h3>
              <p className="text-[#525252] dark:text-[#999999] mb-8 max-w-sm text-center">
                Start by uploading images of a building facade to get a
                comprehensive analysis.
              </p>
              <Link
                to="/upload"
                className="px-6 py-3 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200 hover:translate-y-[-2px]"
              >
                Start Analysis
              </Link>
            </div>
          )}

          {/* Table with rounded container */}
          {!isLoading && !error && !isEmpty && jobs && (
            <div className="overflow-hidden bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#E5E7EB] dark:border-[#333333]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] dark:border-[#333333] bg-[#F9FAFB] dark:bg-[#0a0a0a]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#111111] dark:text-white tracking-wide">
                        ASSESSMENT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#111111] dark:text-white tracking-wide border-l border-[#E5E7EB] dark:border-[#333333]">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#111111] dark:text-white tracking-wide border-l border-[#E5E7EB] dark:border-[#333333]">
                        HEALTH GRADE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#111111] dark:text-white tracking-wide border-l border-[#E5E7EB] dark:border-[#333333]">
                        RISK SCORE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#111111] dark:text-white tracking-wide border-l border-[#E5E7EB] dark:border-[#333333]">
                        FILES
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#111111] dark:text-white tracking-wide border-l border-[#E5E7EB] dark:border-[#333333]">
                        DATE
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-[#111111] dark:text-white tracking-wide border-l border-[#E5E7EB] dark:border-[#333333]">
                        
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#333333]">
                    {jobs.map((job) => (
                      <tr
                        key={job.job_id}
                        onClick={() => navigate(`/results/${job.job_id}`)}
                        className="hover:bg-[#F9FAFB] dark:hover:bg-[#252525] transition-colors duration-200 cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-[#111111] dark:text-white text-sm line-clamp-1">
                            {job.label || `Assessment ${job.job_id.slice(0, 8)}…`}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-l border-[#E5E7EB] dark:border-[#333333]">
                          <span className="text-[#111111] dark:text-white text-sm font-medium">
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-l border-[#E5E7EB] dark:border-[#333333]">
                          <div className="flex items-center gap-2">
                            <span className="text-[#111111] dark:text-white text-sm font-bold">
                              {job.building_health_grade || "—"}
                            </span>
                            {job.building_health_grade && (
                              <span className={`w-3 h-4 rounded-sm ${getHealthGradeBoxColor(job.building_health_grade)}`} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-l border-[#E5E7EB] dark:border-[#333333]">
                          <span className="text-[#111111] dark:text-white font-medium text-sm whitespace-nowrap">
                            {job.overall_risk_score !== null && job.overall_risk_score !== undefined
                              ? `${job.overall_risk_score}/100`
                              : "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-l border-[#E5E7EB] dark:border-[#333333]">
                          <span className="text-[#111111] dark:text-white font-medium text-sm whitespace-nowrap">
                            {job.uploaded_files?.length ?? 0} files
                          </span>
                        </td>
                        <td className="px-6 py-4 border-l border-[#E5E7EB] dark:border-[#333333]">
                          <span className="text-[#525252] dark:text-[#999999] text-sm whitespace-nowrap">
                            {formatDate(job.created_at)}
                          </span>
                        </td>
                        <td className="px-3 py-4 border-l border-[#E5E7EB] dark:border-[#333333]">
                          <div className="relative" ref={openMenuId === job.job_id ? menuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === job.job_id ? null : job.job_id);
                              }}
                              className="p-1 rounded hover:bg-[#F3F4F6] dark:hover:bg-[#333333] transition-colors"
                            >
                              <svg className="w-5 h-5 text-[#525252] dark:text-[#999999]" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {openMenuId === job.job_id && (
                              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#1a1a1a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg shadow-lg z-50">
                                <button
                                  onClick={(e) => handleRenameClick(job, e)}
                                  className="w-full px-4 py-2 text-left text-sm text-[#111111] dark:text-white hover:bg-[#F3F4F6] dark:hover:bg-[#252525] rounded-t-lg flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Rename
                                </button>
                                <button
                                  onClick={(e) => handleDeleteClick(job.job_id, e)}
                                  className="w-full px-4 py-2 text-left text-sm text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#450A0A] rounded-b-lg flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rename Dialog */}
      {renameDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setRenameDialogOpen(false)}>
          <div 
            className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#E5E7EB] dark:border-[#333333] p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-[#111111] dark:text-white mb-4">Rename Assessment</h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new name"
              className="w-full px-4 py-2 bg-white dark:bg-[#0a0a0a] border border-[#E5E7EB] dark:border-[#333333] rounded-lg text-[#111111] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#111111] dark:focus:ring-white mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") setRenameDialogOpen(false);
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRenameDialogOpen(false)}
                className="px-4 py-2 text-[#525252] dark:text-[#999999] hover:text-[#111111] dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={renameMutation.isPending || !renameValue.trim()}
                className="px-4 py-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] rounded-lg font-medium hover:bg-[#1a1a1a] dark:hover:bg-[#f0f0f0] transition-all duration-200 disabled:opacity-50"
              >
                {renameMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
