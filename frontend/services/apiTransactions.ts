import apiClient from "../lib/api";

export const fetchRetailerTransactions = async (
  retailerId: string,
  start?: string,
  end?: string
) => {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);

  const url = `/transactions/retailer/${retailerId}${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await apiClient.get(url);
  return response.data.data;
};

export const createTransaction = async (payload: {
  commodity: string;
  amount: number;
  customerFayda: string;
}) => {
  const response = await apiClient.post("/transactions", payload);
  return response.data.data;
};
