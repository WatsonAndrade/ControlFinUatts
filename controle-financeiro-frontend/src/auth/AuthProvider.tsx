import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, loginWithGoogle, logout, observeAuth } from "./firebase";

type AuthCtx = {
  user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null } | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthCtx["user"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: () => void = () => {};
    try {
      unsub = observeAuth((u) => {
        if (u) setUser({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL });
        else setUser(null);
        setLoading(false);
      });
    } catch (e) {
      console.error("[Auth] Erro ao observar auth:", e);
      setLoading(false); // evita tela branca se der erro de init
    }
    return () => unsub && unsub();
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      login: async () => { await loginWithGoogle(); },
      logout: async () => { await logout(); },
      getIdToken: async () => {
        const u = auth.currentUser;
        if (!u) return null;
        return u.getIdToken();
      },
    }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
