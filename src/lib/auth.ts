import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "./api";
import { apiMe, apiSignIn, apiRegister } from "./api";

const TOKEN_KEY = "stocks-app-desktop:token";
const USER_KEY = "stocks-app-desktop:user";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

function readCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function writeCachedUser(u: AuthUser | null) {
  try {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

export type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function useAuthState(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(readCachedUser());
  const [loading, setLoading] = useState<boolean>(!!getToken());

  // Validate cached token on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      const fresh = await apiMe();
      if (cancelled) return;
      if (fresh) {
        setUser(fresh);
        writeCachedUser(fresh);
      } else {
        setToken(null);
        writeCachedUser(null);
        setUser(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    loading,
    async signIn(email, password) {
      const { token, user: u } = await apiSignIn(email, password);
      setToken(token);
      writeCachedUser(u);
      setUser(u);
    },
    async register(email, password, name) {
      const { token, user: u } = await apiRegister(email, password, name);
      setToken(token);
      writeCachedUser(u);
      setUser(u);
    },
    signOut() {
      setToken(null);
      writeCachedUser(null);
      setUser(null);
    },
  };
}

export { AuthContext };

export function useAuth(): AuthState {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth must be used inside <AuthContext.Provider>");
  return v;
}
