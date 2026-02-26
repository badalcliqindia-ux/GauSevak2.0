// ═══════════════════════════════════════════════════
// services/api.ts  —  server.py  connected
// ═══════════════════════════════════════════════════
//export const BASE_URL = "http://192.168.1.4:8000/api";
  export const BASE_URL = "http://192.168.1.26:8000/api";


export type UserResponse = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: 'customer' | 'delivery_partner' | 'admin' | 'superadmin';
  address?: any;
  is_active: boolean;
  zone?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: UserResponse;
};

async function request<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || 'Server error');
  return data as T;
}

// ── AUTH (server.py exact endpoints) ─────────────────
export const apiLogin = (email: string, password: string) =>
  request<TokenResponse>('/auth/login', 'POST', { email, password });

export const apiRegister = (name: string, email: string, password: string, phone?: string) =>
  request<TokenResponse>('/auth/register', 'POST', { name, email, password, phone: phone || null, role: 'admin' });

export const apiGetMe = (token: string) =>
  request<UserResponse>('/auth/me', 'GET', undefined, token);

// ── DAIRY MODULES ─────────────────────────────────────
export const apiGetMilkYield    = (t: string) => request<any[]>('/dairy/milk-yield',    'GET', undefined, t);
export const apiAddMilkYield    = (t: string, d: any) => request<any>('/dairy/milk-yield',    'POST', d, t);
export const apiUpdateMilkYield = (t: string, id: string, d: any) => request<any>(`/dairy/milk-yield/${id}`,    'PUT', d, t);
export const apiDeleteMilkYield = (t: string, id: string) => request<any>(`/dairy/milk-yield/${id}`,    'DELETE', undefined, t);

export const apiGetInsemination    = (t: string) => request<any[]>('/dairy/insemination', 'GET', undefined, t);
export const apiAddInsemination    = (t: string, d: any) => request<any>('/dairy/insemination', 'POST', d, t);
export const apiUpdateInsemination = (t: string, id: string, d: any) => request<any>(`/dairy/insemination/${id}`, 'PUT', d, t);
export const apiDeleteInsemination = (t: string, id: string) => request<any>(`/dairy/insemination/${id}`, 'DELETE', undefined, t);

export const apiGetDOB    = (t: string) => request<any[]>('/dairy/dob', 'GET', undefined, t);
export const apiAddDOB    = (t: string, d: any) => request<any>('/dairy/dob', 'POST', d, t);
export const apiUpdateDOB = (t: string, id: string, d: any) => request<any>(`/dairy/dob/${id}`, 'PUT', d, t);
export const apiDeleteDOB = (t: string, id: string) => request<any>(`/dairy/dob/${id}`, 'DELETE', undefined, t);

export const apiGetSemen    = (t: string) => request<any[]>('/dairy/semen', 'GET', undefined, t);
export const apiAddSemen    = (t: string, d: any) => request<any>('/dairy/semen', 'POST', d, t);
export const apiUpdateSemen = (t: string, id: string, d: any) => request<any>(`/dairy/semen/${id}`, 'PUT', d, t);
export const apiDeleteSemen = (t: string, id: string) => request<any>(`/dairy/semen/${id}`, 'DELETE', undefined, t);

export const apiGetGenetic    = (t: string) => request<any[]>('/dairy/genetic', 'GET', undefined, t);
export const apiAddGenetic    = (t: string, d: any) => request<any>('/dairy/genetic', 'POST', d, t);
export const apiUpdateGenetic = (t: string, id: string, d: any) => request<any>(`/dairy/genetic/${id}`, 'PUT', d, t);
export const apiDeleteGenetic = (t: string, id: string) => request<any>(`/dairy/genetic/${id}`, 'DELETE', undefined, t);

export const apiGetMedical    = (t: string) => request<any[]>('/dairy/medical', 'GET', undefined, t);
export const apiAddMedical    = (t: string, d: any) => request<any>('/dairy/medical', 'POST', d, t);
export const apiUpdateMedical = (t: string, id: string, d: any) => request<any>(`/dairy/medical/${id}`, 'PUT', d, t);
export const apiDeleteMedical = (t: string, id: string) => request<any>(`/dairy/medical/${id}`, 'DELETE', undefined, t);
