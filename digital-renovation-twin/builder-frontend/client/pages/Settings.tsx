import { Layout } from "@/components/Layout";
import { ApiKeySettings } from "@/components/ApiKeySettings";

export default function Settings() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[#111827] dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-8">
          Configure your API keys and preferences.
        </p>

        <ApiKeySettings />

        <div className="mt-8 bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#E5E7EB] dark:border-[#333] p-6">
          <h3 className="text-lg font-semibold text-[#111827] dark:text-white mb-4">
            About API Usage
          </h3>
          <div className="space-y-3 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            <p>
              <strong className="text-[#374151] dark:text-[#D1D5DB]">Without API Key:</strong>{" "}
              The app uses mock data to demonstrate the full workflow. This is free and requires no setup.
            </p>
            <p>
              <strong className="text-[#374151] dark:text-[#D1D5DB]">With API Key:</strong>{" "}
              Real AI analysis using OpenAI's GPT-4o Vision model. Costs approximately $0.01-0.05 per image analyzed.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security & Privacy
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <p>
              <strong>Session-Only Storage:</strong>{" "}
              Your API key is stored in your browser's session storage and is automatically cleared when you close the browser tab.
            </p>
            <p>
              <strong>Secure Transmission:</strong>{" "}
              Keys are transmitted via secure HTTPS headers, never in URLs or visible request data.
            </p>
            <p>
              <strong>No Server Storage:</strong>{" "}
              We never log, store, or persist your API key on our servers. It is used only in-memory during request processing.
            </p>
            <p>
              <strong>Your Responsibility:</strong>{" "}
              You are responsible for the security of your own API key. Do not share your key or use it on untrusted devices.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Important Notice
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            By using your own API key, you agree that any charges incurred on your OpenAI account are your responsibility. 
            We recommend setting usage limits in your OpenAI dashboard to prevent unexpected charges.
          </p>
        </div>
      </div>
    </Layout>
  );
}
