import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiLogin, apiRegister, UserResponse } from '../services/api';
import { saveToken, getToken, clearAll, saveUser, getSavedUser } from '../services/storage';

type AuthContextType = {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, farm: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]       = useState<UserResponse | null>(null);
  const [token, setToken]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await getToken();
        const u = await getSavedUser();
        if (t && u) { setToken(t); setUser(u); }
      } finally { setLoading(false); }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await saveToken(res.access_token);
    await saveUser(res.user);
    setToken(res.access_token);
    setUser(res.user);
  };

  const signup = async (name: string, email: string, _farm: string, password: string, phone?: string) => {
    const res = await apiRegister(name, email, password, phone);
    await saveToken(res.access_token);
    await saveUser(res.user);
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = async () => { await clearAll(); setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
