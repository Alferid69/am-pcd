import apiClient from "../lib/api";
import type { StockRequest } from "../components/dashboard/types";

export const fetchStockRequests = async (): Promise<StockRequest[]> => {
  const response = await apiClient.get("/stockRequests");
  return response.data.data; // The backend returns { status: "success", data: [...] }
};

export const createStockRequest = async (payload: {
  requestedItems: { commodity: string; quantity: number; unit: string }[];
}) => {
  console.log(" Payload:",payload)
  const response = await apiClient.post("/stockRequests", payload);
  
  return response.data.data;
};

export const updateStockRequestAction = async (
  id: string,
  payload: { action: "APPROVED" | "REJECTED"; remarks?: string }
) => {
  const response = await apiClient.patch(`/stockRequests/${id}`, payload);
  return response.data.data;
};
