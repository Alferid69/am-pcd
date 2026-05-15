import apiClient from "../lib/api";

export interface Commodity {
  _id: string;
  name: string;
  price: number;
  baseUnit: string;
  bulkUnit: string;
  conversionRate: number;
  maxAmountPerCustomer: number;
  description?: string;
}

export const fetchCommodities = async (): Promise<Commodity[]> => {
  const response = await apiClient.get("/commodities");
  return response.data.data;
};

export const createCommodity = async (
  data: Partial<Commodity>,
): Promise<Commodity> => {
  const response = await apiClient.post("/commodities", data);
  return response.data.data;
};

export const updateCommodity = async (
  id: string,
  data: Partial<Commodity>,
): Promise<Commodity> => {
  const response = await apiClient.patch(`/commodities/${id}`, data);
  return response.data.data;
};

export const deleteCommodity = async (id: string): Promise<void> => {
  await apiClient.delete(`/commodities/${id}`);
};
