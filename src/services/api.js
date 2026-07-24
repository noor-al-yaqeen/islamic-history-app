import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════════
// 🚀 ضبط الاتصال بلوحة التحكم (Admin Panel)
// ═══════════════════════════════════════════════════════════════
//
// 1. غير ADMIN_URL إلى رابط Railway بتاعك
// 2. حول USE_API إلى true
//
// مثال: ADMIN_URL = 'https://islamic-history-admin.up.railway.app'
// ═══════════════════════════════════════════════════════════════

const ADMIN_URL = Platform.OS === 'web'
  ? 'http://localhost:4000'              // محلي
  : 'http://10.0.2.2:4000';             // أندرويد емулятор

// ضع رابط Railway هنا بعد ما تشتغل:
// const ADMIN_URL = 'https://islamic-history-admin.up.railway.app';

const USE_API = false; // ← حولها لـ true عشان يجيب البيانات من Admin

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