import apiClient from "./client";

export interface Category {
  id: number;
  name: string;
  icon?: string;
}

export const categoryApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get("/categories");
    return data;
  },

  create: async (payload: { name: string; icon?: string }): Promise<Category> => {
    const { data } = await apiClient.post("/categories", payload);
    return data;
  },

  update: async (id: number, payload: { name?: string; icon?: string }): Promise<Category> => {
    const { data } = await apiClient.patch(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
