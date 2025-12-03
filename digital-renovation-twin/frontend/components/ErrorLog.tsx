"use client";

type Props = {
  logs: string[];
};

export default function ErrorLog({ logs }: Props) {
  if (!logs.length) {
    return null;
  }
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-3">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-sm font-medium text-neutral-50">Activity Log</h3>
        </div>
        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs font-medium text-neutral-400">
          {logs.length} {logs.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto p-4">
        <ul className="space-y-2">
          {logs.map((message, index) => (
            <li key={`${message}-${index}`} className="flex items-start gap-2 text-xs">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-600" />
              <span className="font-mono text-neutral-400">{message}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
