import { useEffect, useState } from "react";
import { isBackendAvailable, getBackendUrl } from "@/lib/backendStatus";
import { AlertTriangle } from "lucide-react";

export function BackendStatusBanner() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkBackend() {
      setChecking(true);
      const available = await isBackendAvailable();
      if (mounted) {
        setIsAvailable(available);
        setChecking(false);
      }
    }

    checkBackend();
    
    // Re-check periodically
    const interval = setInterval(checkBackend, 30000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Don't show anything while checking or if backend is available
  if (checking || isAvailable === true || isAvailable === null) {
    return null;
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Backend unavailable.</strong> The analysis backend at{" "}
          <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded text-xs">
            {getBackendUrl() || "this domain"}
          </code>{" "}
          is not responding. Image upload and analysis features require a running backend server.
        </div>
      </div>
    </div>
  );
}
