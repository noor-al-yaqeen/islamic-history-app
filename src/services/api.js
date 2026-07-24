const ADMIN_URL = process.env.EXPO_PUBLIC_ADMIN_URL || 'http://localhost:4000';
const USE_API = process.env.EXPO_PUBLIC_USE_API === 'true';

// ═══════════════════════════════════════════════════════════════

export async function fetchFromAPI(endpoint) {
  if (!USE_API) return null;
  try {
    const res = await fetch(`${ADMIN_URL}/api/app/${endpoint}`, { signal: AbortSignal.timeout(5000) });
    const json = await res.json();
    if (json.success && json.data) return json.data;
    return null;
  } catch {
    return null;
  }
}

export async function fetchTopic(slug) {
  return fetchFromAPI(`topic/${slug}`);
}

export function isApiEnabled() {
  return USE_API;
}

export { ADMIN_URL, USE_API };