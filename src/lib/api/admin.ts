import apiClient from "./client";

export interface AdminStats {
  total_users: number;
  total_canteens: number;
  total_orders: number;
  active_orders: number;
  total_menu_items: number;
  users_by_role: {
    customer: number;
    canteen: number;
    admin: number;
  };
}

export const adminApi = {
  stats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get("/admin/stats");
    return data;
  },

  listUsers: async (role?: string) => {
    const { data } = await apiClient.get("/admin/users", {
      params: role ? { role } : {},
    });
    return data;
  },

  toggleUser: async (userId: number) => {
    const { data } = await apiClient.patch(`/admin/users/${userId}/toggle`);
    return data;
  },

  changeRole: async (userId: number, role: string) => {
    const { data } = await apiClient.patch(`/admin/users/${userId}/role`, null, {
      params: { role },
    });
    return data;
  },

  listCanteens: async () => {
    const { data } = await apiClient.get("/admin/canteens");
    return data;
  },
};
