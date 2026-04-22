import apiClient from "../lib/api";

export interface Commodity {
  _id: string;
  name: string;
  baseUnit: string;
  bulkUnit: string;
  conversionRate: number;
  description?: string;
}

export const fetchCommodities = async (): Promise<Commodity[]> => {
  const response = await apiClient.get("/commodities");
  return response.data.data;
};
