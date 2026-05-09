import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

const TOKEN_KEY = "manikganj_admin_token";

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}
export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, opts: RequestInit = {}, withAuth = false): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (withAuth) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = (data && data.detail) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  // Public
  list: (collection: string, params?: { upazila?: string }) => {
    const qs = params?.upazila ? `?upazila=${encodeURIComponent(params.upazila)}` : "";
    return request(`/public/${collection}${qs}`);
  },
  dc: () => request(`/public/district_commissioner/single`),
  profileInfo: () => request(`/public/profile_info/single`),
  aboutInfo: () => request(`/public/about_info/single`),
  submitComplaint: (body: { name: string; phone: string; message: string; type: string }) =>
    request(`/public/complaints`, { method: "POST", body: JSON.stringify(body) }),
  submitJoinRequest: (body: { name: string; phone: string; category: string; address?: string; note?: string }) =>
    request(`/public/join_requests`, { method: "POST", body: JSON.stringify(body) }),

  // Auth
  login: (email: string, password: string) =>
    request(`/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => request(`/auth/me`, {}, true),

  // Admin
  adminList: (collection: string) => request(`/admin/${collection}`, {}, true),
  adminCreate: (collection: string, body: any) =>
    request(`/admin/${collection}`, { method: "POST", body: JSON.stringify(body) }, true),
  adminUpdate: (collection: string, id: string, body: any) =>
    request(`/admin/${collection}/${id}`, { method: "PUT", body: JSON.stringify(body) }, true),
  adminDelete: (collection: string, id: string) =>
    request(`/admin/${collection}/${id}`, { method: "DELETE" }, true),
  adminUpsertDC: (body: any) =>
    request(`/admin/district_commissioner/upsert`, { method: "POST", body: JSON.stringify(body) }, true),
  adminUpsertSingleton: (collection: string, body: any) =>
    request(`/admin/${collection}/upsert`, { method: "POST", body: JSON.stringify(body) }, true),
};
