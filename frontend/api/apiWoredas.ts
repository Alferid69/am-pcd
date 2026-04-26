import apiClient from "../lib/api";

export const fetchWoredas = async () => {
  const response = await apiClient.get("/woredaOffices");
  return response.data.data;
};

export const fetchWoredaById = async (id: string) => {
  const response = await apiClient.get(`/woredaOffices/${id}`);
  return response.data.data;
};

export const fetchWoredaStats = async (id: string) => {
  const response = await apiClient.get(`/woredaOffices/${id}/stats`);
  return response.data.data;
};
