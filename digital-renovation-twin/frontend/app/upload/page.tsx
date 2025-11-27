import UploadForm from "@/components/UploadForm";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-md bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Start a new reconstruction job</h2>
        <p className="text-sm text-slate-600">
          Upload several exterior photos of the same building façade. After uploading you will be redirected to the job
          status page where you can trigger COLMAP reconstruction and AI damage detection.
        </p>
      </div>
      <UploadForm />
      <p className="text-sm text-slate-600">
        Already have a job ID?{" "}
        <Link className="text-blue-600 underline" href="/results/example-job-id" prefetch={false}>
          Jump to the results page
        </Link>{" "}
        and replace the ID in the URL.
      </p>
    </div>
  );
}
