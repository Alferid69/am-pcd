import apiClient from "../lib/api";

export const getZones = async () => {
  const response = await apiClient.get("/zoneTradeBureaus");
  return response.data.data;
};
