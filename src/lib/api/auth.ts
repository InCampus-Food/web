import apiClient from "./client";
import { LoginResponse } from "@/types/user";
import { SignupPayload } from "@/types/auth";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (payload: SignupPayload) => {
    const { data } = await apiClient.post("/auth/register", payload);
    return data;
  },

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  logoutAll: async () => {
    await apiClient.post("/auth/logout-all");
  },

  refresh: async () => {
    const { data } = await apiClient.post("/auth/refresh");
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },
};
