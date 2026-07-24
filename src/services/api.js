import { Platform } from 'react-native';

const ADMIN_URL = Platform.OS === 'web' ? 'http://localhost:4000' : 'http://10.0.2.2:4000';
const USE_API = false; // غير إلى true لتفعيل الاتصال بلوحة التحكم

export async function fetchFromAPI(endpoint) {
  if (!USE_API) return null;
  try {
    const res = await fetch(`${ADMIN_URL}/api/app/${endpoint}`, { timeout: 3000 });
    const json = await res.json();
    if (json.success && json.data) return json.data;
    return null;
  } catch {
    return null;
  }
}

export function isApiEnabled() {
  return USE_API;
}

export { ADMIN_URL, USE_API };