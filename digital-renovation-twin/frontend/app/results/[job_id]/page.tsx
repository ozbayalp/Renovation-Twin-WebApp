import ResultsClient from "@/components/ResultsClient";

type Params = {
  job_id: string;
};

export default function ResultsPage({ params }: { params: Params }) {
  return <ResultsClient jobId={params.job_id} />;
}
