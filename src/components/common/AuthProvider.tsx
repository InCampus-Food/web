"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setAuth, clearAuth } = useAuthStore();

  useEffect(() => {
    if (user) return;

    authApi.me()
      .then((data) => setAuth(data))
      .catch(() => {
        clearAuth();
      });
  }, []);

  return <>{children}</>;
}
