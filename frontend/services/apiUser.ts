import apiClient from "../lib/api";

export const updateProfile = async (payload: {
  firstName?: string;
  lastName?: string;
  username?: string;
}) => {
  const response = await apiClient.patch("/users/updateMe", payload);
  return response.data.data.user;
};

export const updatePassword = async (payload: {
  password: string;
  newPassword: string;
}) => {
  const response = await apiClient.patch("/users/updateMyPassword", payload);
  return response.data;
};

// Admin Methods
export const getAllUsers = async () => {
  const response = await apiClient.get("/users");
  return response.data.data; 
};

export const createUserAdmin = async (payload: any) => {
  const response = await apiClient.post("/users", payload);
  return response.data.data.user;
};

export const updateUserAdmin = async (id: string, payload: any) => {
  const response = await apiClient.patch(`/users/${id}`, payload);
  return response.data.data;
};

export const deleteUserAdmin = async (id: string) => {
  const response = await apiClient.delete(`/users/${id}`);
  return response.data;
};

export const adminResetUserPassword = async (id: string, newPassword: string) => {
  const response = await apiClient.patch(`/users/${id}/reset-password`, { newPassword });
  return response.data;
};

