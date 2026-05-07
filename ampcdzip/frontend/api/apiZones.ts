import apiClient from "../lib/api";

export const getZones = async () => {
  const response = await apiClient.get("/zoneTradeBureaus");
  return response.data.data;
};

export const createZoneTradeBureau = async (data: { name: string; email: string }) => {
  const response = await apiClient.post("/zoneTradeBureaus", data);
  return response.data.data;
};
