import apiClient from "./client";
import { Canteen } from "@/types/canteen";

export const canteenApi = {
  list: async (): Promise<Canteen[]> => {
    const { data } = await apiClient.get("/canteens");
    return data;
  },

  getById: async (id: number): Promise<Canteen> => {
    const { data } = await apiClient.get(`/canteens/${id}`);
    return data;
  },

  me: async (): Promise<Canteen> => {
    const { data } = await apiClient.get("/canteens/me");
    return data;
  },

  create: async (payload: { name: string; description?: string; location?: string }) => {
    const { data } = await apiClient.post("/canteens", payload);
    return data;
  },

  update: async (id: number, payload: { name?: string; description?: string; location?: string; is_open?: boolean }) => {
    const { data } = await apiClient.patch(`/canteens/${id}`, payload);
    return data;
  },

  toggle: async (id: number) => {
    const { data } = await apiClient.patch(`/canteens/${id}/toggle`);
    return data;
  },
};
