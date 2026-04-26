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
