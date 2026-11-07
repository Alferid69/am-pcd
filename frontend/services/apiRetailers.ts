import apiClient from "../lib/api";

export const fetchRetailers = async () => {
  const response = await apiClient.get("/retailerCooperatives");
  return response.data.data;
};

export const fetchRetailerById = async (id: string) => {
  const response = await apiClient.get(`/retailerCooperatives/${id}`);
  return response.data.data;
};

export const fetchRetailerPerformance = async (id: string) => {
  const response = await apiClient.get(
    `/retailerCooperatives/${id}/performance`,
  );
  return response.data.data;
};

export const createRetailerCooperative = async (data: { name: string; woredaOffice: string; location?: string }) => {
  const response = await apiClient.post("/retailerCooperatives", data);
  return response.data.data;
};
