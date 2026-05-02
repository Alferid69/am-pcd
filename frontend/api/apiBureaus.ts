import apiClient from "../lib/api";

export const getBureaus = async () => {
  const response = await apiClient.get("/retailerCooperativesBureaus");
  return response.data.data;
};

export const createBureau = async (data: { name: string; email: string }) => {
  const response = await apiClient.post("/retailerCooperativesBureaus", data);
  return response.data.data;
};
