import UploadForm from "@/components/UploadForm";
import BuildingAnimation from "@/components/BuildingAnimation";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section with Animation */}
      <div className="flex flex-col items-center text-center">
        <BuildingAnimation />
        <div className="mt-12">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">New Assessment</h1>
          <p className="mt-2 max-w-md text-sm text-neutral-400">
            Upload façade photos to generate AI-powered risk analysis, health grades, and repair cost estimates.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form Section */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {/* Section Header */}
            <div className="border-b border-neutral-800 px-6 py-4">
              <h2 className="text-base font-medium text-neutral-50">Upload Façade Photos</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Upload 3–10 high-quality photos of the same building façade from different angles.
              </p>
            </div>
            {/* Form */}
            <div className="p-6">
              <UploadForm />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* How it works */}
          <div className="card overflow-hidden">
            <div className="border-b border-neutral-800 px-6 py-4">
              <h3 className="text-sm font-medium text-neutral-50">How it works</h3>
            </div>
            <div className="p-6">
              <ol className="space-y-5 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-300">1</span>
                  <div>
                    <p className="font-medium text-neutral-50">Upload photos</p>
                    <p className="mt-0.5 text-neutral-500">Select 3–10 photos of the building façade</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-300">2</span>
                  <div>
                    <p className="font-medium text-neutral-50">AI analysis</p>
                    <p className="mt-0.5 text-neutral-500">Our AI detects damage, cracks, and deterioration</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-xs font-medium text-neutral-300">3</span>
                  <div>
                    <p className="font-medium text-neutral-50">Get your report</p>
                    <p className="mt-0.5 text-neutral-500">Receive risk scores, health grade, and cost estimates</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Have a job ID? */}
          <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-900/50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800">
                <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-50">Already have a job ID?</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Go to{" "}
                  <Link className="text-neutral-300 underline underline-offset-2 transition-colors hover:text-white" href="/results/your-job-id">
                    /results/your-job-id
                  </Link>{" "}
                  and replace with your ID.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
