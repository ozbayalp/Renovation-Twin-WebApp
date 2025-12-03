/**
 * Backend availability checker
 * Detects if the Python backend is reachable
 */

import { API_BASE_URL } from "./api";

let backendAvailable: boolean | null = null;
let lastCheck: number = 0;
const CHECK_INTERVAL = 30000; // Re-check every 30 seconds

/**
 * Check if the backend is available
 * Caches result for 30 seconds
 */
export async function isBackendAvailable(): Promise<boolean> {
  const now = Date.now();
  
  // Return cached result if still valid
  if (backendAvailable !== null && now - lastCheck < CHECK_INTERVAL) {
    return backendAvailable;
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    backendAvailable = response.ok;
  } catch {
    backendAvailable = false;
  }
  
  lastCheck = now;
  return backendAvailable;
}

/**
 * Reset the cached status (useful after config changes)
 */
export function resetBackendStatus(): void {
  backendAvailable = null;
  lastCheck = 0;
}

/**
 * Get the current backend URL for display purposes
 */
export function getBackendUrl(): string {
  return API_BASE_URL || window.location.origin;
}
