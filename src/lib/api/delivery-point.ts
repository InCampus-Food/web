import apiClient from "./client";
import { DeliveryPoint } from "@/types/order";

export const deliveryPointApi = {
  list: async (): Promise<DeliveryPoint[]> => {
    const { data } = await apiClient.get("/delivery-points");
    return data;
  },

  create: async (payload: {
    name: string;
    building: string;
    floor?: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    is_default?: boolean;
  }): Promise<DeliveryPoint> => {
    const { data } = await apiClient.post("/delivery-points", payload);
    return data;
  },

  update: async (id: number, payload: Partial<{
    name: string;
    building: string;
    floor: string;
    notes: string;
    latitude: number;
    longitude: number;
    is_default: boolean;
  }>): Promise<DeliveryPoint> => {
    const { data } = await apiClient.patch(`/delivery-points/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/delivery-points/${id}`);
  },

  setDefault: async (id: number): Promise<DeliveryPoint> => {
    const { data } = await apiClient.patch(`/delivery-points/${id}/set-default`);
    return data;
  },
};