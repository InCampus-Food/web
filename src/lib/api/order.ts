import apiClient from "./client";
import { Order } from "@/types/order";

export const orderApi = {
  create: async (payload: {
    canteen_id: number;
    delivery_point_id: number;
    items: { menu_item_id: number; quantity: number; notes?: string }[];
    notes?: string;
  }): Promise<Order> => {
    const { data } = await apiClient.post("/orders", payload);
    return data;
  },

  myOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get("/orders/me");
    return data;
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },

  cancel: async (id: number): Promise<Order> => {
    const { data } = await apiClient.patch(`/orders/${id}/cancel`);
    return data;
  },
};
