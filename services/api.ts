export const BASE_URL = "http://192.168.1.22:8000/api";
// export const BASE_URL = "http://192.168.100.231:8000/api";

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: "customer" | "delivery_partner" | "admin" | "superadmin";
  address?: any;
  is_active: boolean;
  zone?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  user: UserResponse;
};

export type WorkerResponse = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  farm_name?: string | null;
  designation?: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
};

export type WorkerTokenResponse = {
  access_token: string;
  token_type: string;
  worker: WorkerResponse;
};

async function request<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: object,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.detail || "Server error");
  return data as T;
}

export const apiLogin = (email: string, password: string) =>
  request<TokenResponse>("/auth/login", "POST", {
    email:    email.toLowerCase().trim(),
    password,
  });

export const apiRegister = (
  name: string,
  email: string,
  farm: string,
  password: string,
  phone?: string,
) =>
  request<TokenResponse>("/auth/register", "POST", {
    name:     name.trim(),
    email:    email.toLowerCase().trim(),
    password,
    phone:    phone?.trim() || null,
    role:     "admin",
  });

export const apiGetMe = (token: string) =>
  request<UserResponse>("/auth/me", "GET", undefined, token);

export const apiWorkerRegister = (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  farm_name?: string;
  designation?: string;
}) =>
  request<WorkerTokenResponse>("/worker/auth/register", "POST", {
    ...data,
    email: data.email.toLowerCase().trim(),
  });

export const apiWorkerLogin = (email: string, password: string) =>
  request<WorkerTokenResponse>("/worker/auth/login", "POST", {
    email: email.toLowerCase().trim(),
    password,
  });

export const apiWorkerGetMe = (token: string) =>
  request<WorkerResponse>("/worker/auth/me", "GET", undefined, token);

export const apiWorkerUpdateProfile = (
  token: string,
  data: { name?: string; phone?: string; farm_name?: string; designation?: string },
) => request<WorkerResponse>("/worker/auth/profile", "PUT", data, token);

class ApiService {}

export const apiWorkerGetCows = (token: string) =>
  request<any[]>("/worker/cows", "GET", undefined, token);

export type MilkEntry = {
  id: string;
  worker_id: string;
  worker_name: string;
  cow_id: string;
  cow_name: string;
  cow_tag: string;
  quantity: number;
  shift: 'morning' | 'evening';
  date: string;
  notes?: string;
  created_at: string;
};

export type ShiftStatus = {
  date: string;
  morning_done: boolean;
  morning_count: number;
  evening_done: boolean;
  evening_count: number;
};

export const apiWorkerAddMilk = (token: string, data: {
  cow_id: string;
  cow_name: string;
  cow_tag: string;
  quantity: number;
  shift: 'morning' | 'evening';
  date: string;
  notes?: string;
}) => request<MilkEntry>("/worker/milk", "POST", data, token);

export const apiWorkerGetTodayMilk = (token: string) =>
  request<MilkEntry[]>("/worker/milk/today", "GET", undefined, token);

export const apiWorkerGetShiftStatus = (token: string) =>
  request<ShiftStatus>("/worker/milk/shift-status", "GET", undefined, token);

export type FeedEntry = {
  id: string;
  worker_id: string;
  worker_name: string;
  cow_id: string;
  cow_name: string;
  cow_tag: string;
  date: string;               
  shift: 'morning' | 'evening';
  fed_at: string;           
  created_at: string;
};

export const apiWorkerGetFeedStatus = (
  token: string,
  date: string,
  shift: 'morning' | 'evening'
) =>
  request<FeedEntry[]>(
    `/worker/feed?date=${date}&shift=${shift}`,
    'GET',
    undefined,
    token
  );

  export const apiWorkerMarkFed = (
  token: string,
  data: {
    cow_id: string;
    cow_name: string;
    cow_tag: string;
    date: string;
    shift: 'morning' | 'evening';
  }
) => request<FeedEntry>('/worker/feed', 'POST', data, token);

export const apiWorkerUnmarkFed = (
  token: string,
  cow_id: string,
  date: string,
  shift: 'morning' | 'evening'
) =>
  request<{ success: boolean }>(
    `/worker/feed?cow_id=${cow_id}&date=${date}&shift=${shift}`,
    'DELETE',
    undefined,
    token
  );

export type HealthLog = {
  id: string;
  worker_id: string;
  worker_name: string;
  cow_id: string;
  cow_name: string;
  cow_tag: string;
  status: string;   
  date: string;     
  created_at: string;
};

export const apiWorkerGetTodayHealthLogs = (token: string) => {
  const today = new Date().toISOString().split('T')[0];
  return request<HealthLog[]>(`/worker/health?date=${today}`, 'GET', undefined, token);
};

export const apiWorkerAddHealthLog = (
  token: string,
  data: {
    cow_id: string;
    cow_name: string;
    cow_tag: string;
    status: string;
    date: string;
  }
) => request<HealthLog>('/worker/health', 'POST', data, token);

export const api = new ApiService();