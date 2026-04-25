import apiClient from "../lib/api";

export const fetchRetailers = async () => {
  const response = await apiClient.get("/retailerCooperatives");
  return response.data.data;
};

export const fetchRetailerById = async (id: string) => {
  const response = await apiClient.get(`/retailerCooperatives/${id}`);
  return response.data.data;
};
