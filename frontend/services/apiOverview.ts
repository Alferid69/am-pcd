import apiClient from "../lib/api";

export const fetchOverviewStats = async () => {
  const response = await apiClient.get("/overview/stats");
  return response.data.data;
};
