// ═══════════════════════════════════════════════════
// services/api.ts  —  server.py connected
// ═══════════════════════════════════════════════════
// export const BASE_URL = "http://192.168.1.4:8000/api";
export const BASE_URL = "http://192.168.1.22:8000/api";

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

// ── Worker types ──────────────────────────────────────────────────────────────
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

// ── Core request helper ───────────────────────────────────────────────────────
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

// ── AUTH ──────────────────────────────────────────────────────────────────────

// ✅ FIX: normalize email to lowercase on both login and register
// so "Admin@Farm.com" and "admin@farm.com" always match in MongoDB
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

// ── WORKER AUTH ───────────────────────────────────────────────────────────────
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

// ── DAIRY MODULES — original short-form functions (kept for compatibility) ────
export const apiGetMilkYield = (t: string) =>
  request<any[]>("/dairy/milk-yield", "GET", undefined, t);
export const apiAddMilkYield = (t: string, d: any) =>
  request<any>("/dairy/milk-yield", "POST", d, t);
export const apiUpdateMilkYield = (t: string, id: string, d: any) =>
  request<any>(`/dairy/milk-yield/${id}`, "PUT", d, t);
export const apiDeleteMilkYield = (t: string, id: string) =>
  request<any>(`/dairy/milk-yield/${id}`, "DELETE", undefined, t);

export const apiGetInsemination = (t: string) =>
  request<any[]>("/dairy/insemination", "GET", undefined, t);
export const apiAddInsemination = (t: string, d: any) =>
  request<any>("/dairy/insemination", "POST", d, t);
export const apiUpdateInsemination = (t: string, id: string, d: any) =>
  request<any>(`/dairy/insemination/${id}`, "PUT", d, t);
export const apiDeleteInsemination = (t: string, id: string) =>
  request<any>(`/dairy/insemination/${id}`, "DELETE", undefined, t);

export const apiGetDOB = (t: string) =>
  request<any[]>("/dairy/dob", "GET", undefined, t);
export const apiAddDOB = (t: string, d: any) =>
  request<any>("/dairy/dob", "POST", d, t);
export const apiUpdateDOB = (t: string, id: string, d: any) =>
  request<any>(`/dairy/dob/${id}`, "PUT", d, t);
export const apiDeleteDOB = (t: string, id: string) =>
  request<any>(`/dairy/dob/${id}`, "DELETE", undefined, t);

export const apiGetSemen = (t: string) =>
  request<any[]>("/dairy/semen", "GET", undefined, t);
export const apiAddSemen = (t: string, d: any) =>
  request<any>("/dairy/semen", "POST", d, t);
export const apiUpdateSemen = (t: string, id: string, d: any) =>
  request<any>(`/dairy/semen/${id}`, "PUT", d, t);
export const apiDeleteSemen = (t: string, id: string) =>
  request<any>(`/dairy/semen/${id}`, "DELETE", undefined, t);

export const apiGetGenetic = (t: string) =>
  request<any[]>("/dairy/genetic", "GET", undefined, t);
export const apiAddGenetic = (t: string, d: any) =>
  request<any>("/dairy/genetic", "POST", d, t);
export const apiUpdateGenetic = (t: string, id: string, d: any) =>
  request<any>(`/dairy/genetic/${id}`, "PUT", d, t);
export const apiDeleteGenetic = (t: string, id: string) =>
  request<any>(`/dairy/genetic/${id}`, "DELETE", undefined, t);

export const apiGetMedical = (t: string, status?: string) =>
  request<any[]>(
    `/dairy/medical${status ? `?status=${status}` : ""}`,
    "GET",
    undefined,
    t,
  );
export const apiAddMedical = (t: string, d: any) =>
  request<any>("/dairy/medical", "POST", d, t);
export const apiUpdateMedical = (t: string, id: string, d: any) =>
  request<any>(`/dairy/medical/${id}`, "PUT", d, t);
export const apiDeleteMedical = (t: string, id: string) =>
  request<any>(`/dairy/medical/${id}`, "DELETE", undefined, t);

// ════════════════════════════════════════════════════════════════════════════
// CLASS-STYLE API
// ════════════════════════════════════════════════════════════════════════════
class ApiService {
  getMilkYield(token: string, search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<any[]>(`/dairy/milk-yield${q}`, "GET", undefined, token);
  }
  createMilkYield(token: string, data: { cowSrNo: string; cowName?: string; date: string; morningYield?: number; eveningYield?: number; totalYield?: number; fatPercentage?: number; snfPercentage?: number; notes?: string }) {
    return request<any>("/dairy/milk-yield", "POST", data, token);
  }
  updateMilkYield(token: string, id: string, data: object) {
    return request<any>(`/dairy/milk-yield/${id}`, "PUT", data, token);
  }
  deleteMilkYield(token: string, id: string) {
    return request<any>(`/dairy/milk-yield/${id}`, "DELETE", undefined, token);
  }

  getInsemination(token: string, search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<any[]>(`/dairy/insemination${q}`, "GET", undefined, token);
  }
  createInsemination(token: string, data: { cowSrNo: string; cowName?: string; inseminationDate: string; pregnancyStatus?: boolean; pdDone?: boolean; pregnancyStatusDate?: string; doctorName?: string; actualCalvingDate?: string; heatAfterCalvingDate?: string }) {
    return request<any>("/dairy/insemination", "POST", data, token);
  }
  updateInsemination(token: string, id: string, data: object) {
    return request<any>(`/dairy/insemination/${id}`, "PUT", data, token);
  }
  deleteInsemination(token: string, id: string) {
    return request<any>(`/dairy/insemination/${id}`, "DELETE", undefined, token);
  }

  getDOB(token: string, search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<any[]>(`/dairy/dob${q}`, "GET", undefined, token);
  }
  createDOB(token: string, data: { cowSrNo: string; cowName?: string; dateOfBirth: string; gender?: string; fatherTag?: string; motherTag?: string; breed?: string; birthWeight?: number; calvingType?: string; notes?: string }) {
    return request<any>("/dairy/dob", "POST", data, token);
  }
  updateDOB(token: string, id: string, data: object) {
    return request<any>(`/dairy/dob/${id}`, "PUT", data, token);
  }
  deleteDOB(token: string, id: string) {
    return request<any>(`/dairy/dob/${id}`, "DELETE", undefined, token);
  }

  getSemen(token: string, search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<any[]>(`/dairy/semen${q}`, "GET", undefined, token);
  }
  createSemen(token: string, data: { bullSrNo: string; bullName?: string; breed?: string; femalCalves?: number; maleCalves?: number; damaged?: number; conceptionCount?: number; totalDoses?: number; notes?: string }) {
    return request<any>("/dairy/semen", "POST", data, token);
  }
  updateSemen(token: string, id: string, data: object) {
    return request<any>(`/dairy/semen/${id}`, "PUT", data, token);
  }
  deleteSemen(token: string, id: string) {
    return request<any>(`/dairy/semen/${id}`, "DELETE", undefined, token);
  }

  getGenetic(token: string, search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<any[]>(`/dairy/genetic${q}`, "GET", undefined, token);
  }
  createGenetic(token: string, data: { cowSrNo: string; cowName?: string; breed?: string; bloodline?: string; fatherTag?: string; motherTag?: string; geneticMerit?: string; ebv?: number; dnaTestDone?: boolean; dnaTestDate?: string; notes?: string }) {
    return request<any>("/dairy/genetic", "POST", data, token);
  }
  updateGenetic(token: string, id: string, data: object) {
    return request<any>(`/dairy/genetic/${id}`, "PUT", data, token);
  }
  deleteGenetic(token: string, id: string) {
    return request<any>(`/dairy/genetic/${id}`, "DELETE", undefined, token);
  }

  getMedical(token: string, search?: string, status?: "healthy" | "unhealthy") {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    const q = params.toString() ? `?${params.toString()}` : "";
    return request<any[]>(`/dairy/medical${q}`, "GET", undefined, token);
  }
  createMedical(token: string, data: { cowSrNo: string; cowName?: string; cowAge?: string; currentStatus?: string; lastVaccinationDate?: string; nextVaccinationDate?: string; vaccinationName?: string; lastIssueName?: string; lastIssueDate?: string; currentIssueName?: string; currentIssueDate?: string; treatmentGiven?: string; doctorName?: string; medicineName?: string; notes?: string }) {
    return request<any>("/dairy/medical", "POST", data, token);
  }
  updateMedical(token: string, id: string, data: object) {
    return request<any>(`/dairy/medical/${id}`, "PUT", data, token);
  }
  deleteMedical(token: string, id: string) {
    return request<any>(`/dairy/medical/${id}`, "DELETE", undefined, token);
  }
}

export const api = new ApiService();