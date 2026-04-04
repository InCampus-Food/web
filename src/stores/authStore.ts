"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, token, refreshToken) => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("refresh_token", refreshToken);
        setCookie("access_token", token);
        set({ user, token, refreshToken, isAuthenticated: true });
      },
      setToken: (token) => {
        localStorage.setItem("access_token", token);
        setCookie("access_token", token);
        set({ token });
      },
      clearAuth: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        deleteCookie("access_token");
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    { name: "auth-storage" }
  )
);
