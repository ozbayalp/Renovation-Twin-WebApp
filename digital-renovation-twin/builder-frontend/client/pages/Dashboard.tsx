import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getAllJobs, JobStatus } from "@/lib/api";

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
  
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ["jobs"],
    queryFn: getAllJobs,
  });

  const isEmpty = !jobs || jobs.length === 0;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-white dark:bg-[#0a0a0a] border-b border-[#E5E7EB] dark:border-[#333333]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#111111] dark:text-white mb-4">
            All Assessments
          </h1>
          <p className="text-lg text-[#525252] dark:text-[#999999]">
            View and manage all your building facade analyses in one place.
            Track progress, access reports, and monitor risk levels.
          </p>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
