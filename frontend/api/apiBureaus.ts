import apiClient from "../lib/api";

export const getBureaus = async () => {
  const response = await apiClient.get("/retailerCooperativesBureaus");
  return response.data.data;
};
