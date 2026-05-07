import apiClient from "../lib/api";
import type { Allocation } from "../components/dashboard/types";

export const fetchAllocations = async (): Promise<Allocation[]> => {
  const response = await apiClient.get("/allocations");
  return response.data.data;
};

export const createAllocation = async (payload: {
  stockRequest: string;
  retailerCooperative: string;
  allocatedItems: { commodity: string; quantity: number }[];
}) => {
  const response = await apiClient.post("/allocations", payload);
  return response.data.data;
};

export const updateAllocationStatus = async (
  id: string,
  payload: { status: "DELIVERED"; deliveryDate: string },
) => {
  const response = await apiClient.patch(`/allocations/${id}`, payload);
  return response.data.data;
};
