import apiClient from "./client";

export const uploadApi = {
  uploadImage: async (file: File, folder: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const { data } = await apiClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
