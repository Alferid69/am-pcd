import apiClient from "../lib/api";

export const fetchWoredas = async () => {
  const response = await apiClient.get("/woredaOffices");
  return response.data.data;
};
