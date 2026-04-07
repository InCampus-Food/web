import apiClient from "./client";
import { Payment, PaymentMethod } from "@/types/payment";

export const paymentApi = {
  create: async (order_id: number, method: PaymentMethod): Promise<Payment> => {
    const { data } = await apiClient.post("/payments", { order_id, method });
    return data;
  },

  getByOrder: async (order_id: number): Promise<Payment> => {
    const { data } = await apiClient.get(`/payments/${order_id}`);
    return data;
  },
};
