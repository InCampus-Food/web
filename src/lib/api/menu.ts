import apiClient from "./client";
import { MenuItem, MenuItemCreate, MenuItemUpdate } from "@/types/menu";

export const menuApi = {
  list: async (canteenId: number, category?: string): Promise<MenuItem[]> => {
    const { data } = await apiClient.get(`/canteens/${canteenId}/menu`, {
      params: category ? { category } : {},
    });
    return data;
  },

  create: async (canteenId: number, payload: MenuItemCreate): Promise<MenuItem> => {
    const { data } = await apiClient.post(`/canteens/${canteenId}/menu`, payload);
    return data;
  },

  update: async (canteenId: number, itemId: number, payload: MenuItemUpdate): Promise<MenuItem> => {
    const { data } = await apiClient.patch(`/canteens/${canteenId}/menu/${itemId}`, payload);
    return data;
  },

  delete: async (canteenId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/canteens/${canteenId}/menu/${itemId}`);
  },
};
