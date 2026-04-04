import apiClient from "./client";
import { AuthResponse } from "@/types/user";
import { SignupPayload } from "@/types/auth";

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (payload: SignupPayload) => {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },

  logout: async (refreshToken: string) => {
    await apiClient.post(
      "/auth/logout",
      {},
      { headers: { "X-Refresh-Token": refreshToken } }
    );
  },

  logoutAll: async () => {
    await apiClient.post("/auth/logout-all");
  },

  refresh: async (refreshToken: string) => {
    const { data } = await apiClient.post(
      "/auth/refresh",
      {},
      { headers: { "X-Refresh-Token": refreshToken } }
    );
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};
