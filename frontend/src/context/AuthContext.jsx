import { useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../lib/api";
import AuthContext from "./authContextStore";

const TOKEN_KEY = "chronicle.auth.token";

function readStoredToken() {
  try {
    return (
      window.localStorage.getItem(TOKEN_KEY) ||
      window.sessionStorage.getItem(TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

function persistToken(token, remember) {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
}

function clearStoredToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let active = true;

    authApi
      .getProfile(token)
      .then((data) => {
        if (active) {
          setUser(data?.user || null);
        }
      })
      .catch((error) => {
        if (!active) return;

        if (error?.status === 401 || error?.status === 403) {
          clearStoredToken();
          setToken(null);
        }

        setUser(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async ({ email, password, remember = true }) => {
    const data = await authApi.login({ email, password });
    persistToken(data.token, remember);
    setLoading(true);
    setToken(data.token);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const data = await authApi.getProfile(token);
    setUser(data?.user || null);
    return data?.user || null;
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      refreshProfile,
    }),
    [token, user, loading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
