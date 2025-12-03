import { useState, useEffect } from "react";
import { getApiKey, setApiKey, clearApiKey, isValidKeyFormat, hasApiKey } from "@/lib/apiKey";

interface ApiKeySettingsProps {
  onClose?: () => void;
}

export function ApiKeySettings({ onClose }: ApiKeySettingsProps) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setKey(storedKey);
      setSaved(true);
    }
  }, []);

  const handleSave = () => {
    setError("");
    
    if (!key.trim()) {
      clearApiKey();
      setSaved(false);
      setKey("");
      return;
    }

    if (!isValidKeyFormat(key.trim())) {
      setError("Invalid API key format. OpenAI keys start with 'sk-'");
      return;
    }

    setApiKey(key.trim());
    setSaved(true);
  };

  const handleClear = () => {
    clearApiKey();
    setKey("");
    setSaved(false);
    setError("");
  };

  const maskedKey = key ? `sk-...${key.slice(-4)}` : "";

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#E5E7EB] dark:border-[#333] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#111827] dark:text-white">
          OpenAI API Key
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#111827] dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mb-4">
        To use real AI damage detection, enter your OpenAI API key. Your key is stored in your browser's session storage (cleared when you close this tab) and sent securely via HTTPS headers. Without a key, the app uses mock data for demonstration.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-1">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder="sk-..."
              className="w-full px-3 py-2 pr-20 border border-[#D1D5DB] dark:border-[#4B5563] rounded-lg bg-white dark:bg-[#262626] text-[#111827] dark:text-white placeholder-[#9CA3AF] focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#111827] dark:hover:text-white px-2 py-1"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saved && key === getApiKey()}
            className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {saved ? "Saved" : "Save Key"}
          </button>
          {hasApiKey() && (
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-[#D1D5DB] dark:border-[#4B5563] text-[#374151] dark:text-[#D1D5DB] rounded-lg hover:bg-[#F3F4F6] dark:hover:bg-[#333] text-sm font-medium"
            >
              Clear Key
            </button>
          )}
        </div>

        {saved && key && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>API key saved. AI features enabled.</span>
          </div>
        )}

        {!key && (
          <div className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>No API key set. Using mock data for demonstration.</span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[#E5E7EB] dark:border-[#333]">
        <p className="text-xs text-[#9CA3AF]">
          Get your API key from{" "}
          <a
            href="https://platform.openai.com/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563EB] hover:underline"
          >
            platform.openai.com/api-keys
          </a>
        </p>
      </div>
    </div>
  );
}

export function ApiKeyBadge() {
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    setHasKey(hasApiKey());
  }, []);

  if (hasKey) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        AI Enabled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3F4F6] dark:bg-[#333] text-[#6B7280] dark:text-[#9CA3AF]">
      Demo Mode
    </span>
  );
}
