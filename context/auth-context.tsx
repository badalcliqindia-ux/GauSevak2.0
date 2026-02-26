import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiLogin, apiRegister, apiWorkerLogin, apiWorkerRegister, apiWorkerUpdateProfile, UserResponse, WorkerResponse } from '../services/api';
import { saveToken, getToken, clearAll, saveUser, getSavedUser } from '../services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Worker storage helpers (separate keys from admin) ─────────────────────────
const WORKER_TOKEN_KEY = 'worker_token';
const WORKER_USER_KEY  = 'worker_user';

const saveWorkerToken = (t: string)         => AsyncStorage.setItem(WORKER_TOKEN_KEY, t);
const getWorkerToken  = ()                  => AsyncStorage.getItem(WORKER_TOKEN_KEY);
const saveWorkerUser  = (u: WorkerResponse) => AsyncStorage.setItem(WORKER_USER_KEY, JSON.stringify(u));
const getSavedWorker  = async (): Promise<WorkerResponse | null> => {
  const raw = await AsyncStorage.getItem(WORKER_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
const clearWorkerData = () =>
  Promise.all([
    AsyncStorage.removeItem(WORKER_TOKEN_KEY),
    AsyncStorage.removeItem(WORKER_USER_KEY),
  ]);

// ── Context type ──────────────────────────────────────────────────────────────
type AuthContextType = {
  // Admin / farm-owner (unchanged)
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, farm: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;

  // Worker
  worker: WorkerResponse | null;
  workerToken: string | null;
  workerLoading: boolean;
  workerLogin: (email: string, password: string) => Promise<void>;
  workerSignup: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    farm_name?: string;
    designation?: string;
  }) => Promise<void>;
  workerLogout: () => Promise<void>;
  workerUpdateProfile: (fields: {
    name?: string;
    phone?: string;
    farm_name?: string;
    designation?: string;
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // admin state
  const [user, setUser]       = useState<UserResponse | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // worker state
  const [worker, setWorker]               = useState<WorkerResponse | null>(null);
  const [workerToken, setWorkerToken]     = useState<string | null>(null);
  const [workerLoading, setWorkerLoading] = useState(true);

  // ── Restore both sessions on mount ─────────────────────────────────────────
  useEffect(() => {
    // restore admin
    (async () => {
      try {
        const t = await getToken();
        const u = await getSavedUser();
        if (t && u) { setToken(t); setUser(u); }
      } finally { setLoading(false); }
    })();

    // restore worker
    (async () => {
      try {
        const t = await getWorkerToken();
        const w = await getSavedWorker();
        if (t && w) { setWorkerToken(t); setWorker(w); }
      } finally { setWorkerLoading(false); }
    })();
  }, []);

  // ── Admin auth (unchanged logic) ────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await saveToken(res.access_token);
    await saveUser(res.user);
    setToken(res.access_token);
    setUser(res.user);
  };

  const signup = async (name: string, email: string, _farm: string, password: string, phone?: string) => {
    const res = await apiRegister(name, email, _farm, password, phone);
    await saveToken(res.access_token);
    await saveUser(res.user);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = async () => {
    await clearAll();
    setToken(null);
    setUser(null);
  };

  // ── Worker auth ─────────────────────────────────────────────────────────────
  const workerLogin = async (email: string, password: string) => {
    const res = await apiWorkerLogin(email, password);
    await saveWorkerToken(res.access_token);
    await saveWorkerUser(res.worker);
    setWorkerToken(res.access_token);
    setWorker(res.worker);
  };

  const workerSignup = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    farm_name?: string;
    designation?: string;
  }) => {
    const res = await apiWorkerRegister(data);
    await saveWorkerToken(res.access_token);
    await saveWorkerUser(res.worker);
    setWorkerToken(res.access_token);
    setWorker(res.worker);
  };

  const workerLogout = async () => {
    await clearWorkerData();
    setWorkerToken(null);
    setWorker(null);
  };

  const workerUpdateProfile = async (fields: {
    name?: string;
    phone?: string;
    farm_name?: string;
    designation?: string;
  }) => {
    if (!workerToken) throw new Error('Not authenticated as worker');
    const updated = await apiWorkerUpdateProfile(workerToken, fields);
    await saveWorkerUser(updated);
    setWorker(updated);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, signup, logout,
      worker, workerToken, workerLoading, workerLogin, workerSignup, workerLogout, workerUpdateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hooks ─────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

/** Convenience hook for worker-only screens */
export const useWorkerAuth = () => {
  const { worker, workerToken, workerLoading, workerLogin, workerSignup, workerLogout, workerUpdateProfile } = useAuth();
  return { worker, workerToken, workerLoading, workerLogin, workerSignup, workerLogout, workerUpdateProfile };
};