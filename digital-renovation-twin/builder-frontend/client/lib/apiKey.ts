/**
 * OpenAI API Key Management
 * 
 * SECURITY NOTES:
 * - API keys are stored in sessionStorage (cleared when browser tab closes)
 * - Keys are transmitted only over HTTPS in production
 * - Keys are sent via secure headers, never in URLs or request bodies
 * - Backend processes keys in-memory only, never logged or persisted
 * - Users are responsible for their own API key security
 * 
 * The key is only stored locally in the user's browser and sent to the 
 * backend via the X-OpenAI-API-Key header for processing requests.
 */

const STORAGE_KEY = "facade_analyzer_openai_key";

// Use sessionStorage for better security - key is cleared when browser tab closes
// Users must re-enter key each session, but this prevents key persistence
const storage = typeof window !== "undefined" ? window.sessionStorage : null;

/**
 * Get the stored OpenAI API key
 */
export function getApiKey(): string | null {
  if (!storage) return null;
  return storage.getItem(STORAGE_KEY);
}

/**
 * Save the OpenAI API key to sessionStorage
 * Key will be cleared when the browser tab is closed
 */
export function setApiKey(key: string): void {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, key);
}

/**
 * Remove the stored API key
 */
export function clearApiKey(): void {
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

/**
 * Check if an API key is stored
 */
export function hasApiKey(): boolean {
  return !!getApiKey();
}

/**
 * Validate API key format (basic check)
 */
export function isValidKeyFormat(key: string): boolean {
  // OpenAI keys start with "sk-" and are typically 51+ characters
  return key.startsWith("sk-") && key.length >= 40;
}

/**
 * Get headers object with API key if available
 */
export function getApiKeyHeaders(): Record<string, string> {
  const key = getApiKey();
  if (key) {
    return { "X-OpenAI-API-Key": key };
  }
  return {};
}
