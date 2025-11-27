"use client";

type Props = {
  logs: string[];
};

export default function ErrorLog({ logs }: Props) {
  if (!logs.length) {
    return null;
  }
  return (
    <section className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
      <h3 className="text-base font-semibold">Recent errors</h3>
      <ul className="mt-3 space-y-2">
        {logs.map((message, index) => (
          <li key={`${message}-${index}`} className="font-mono">
            {message}
          </li>
        ))}
      </ul>
    </section>
  );
}
