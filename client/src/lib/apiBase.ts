const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

/**
 * API origin used by the browser. An empty value preserves the current
 * same-origin development behavior while VITE_API_BASE_URL points Cloudflare
 * Pages builds at the Render API.
 */
export const API_BASE_URL = configuredApiBaseUrl?.replace(/\/$/, "") ?? "";

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
