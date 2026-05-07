import apiClient from "../lib/api";
import type {
  Customer,
  CreateCustomerPayload,
} from "../components/dashboard/types";

export const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get("/customers");
  console.log("customers", response.data.data);
  return response.data.data;
};

export const fetchCustomersByWoreda = async (
  woredaId: string,
): Promise<Customer[]> => {
  const response = await apiClient.get(`/customers/woredaOffice/${woredaId}`);
  console.log("customers", response);
  return response.data.data;
};

export const createCustomer = async (
  payload: CreateCustomerPayload,
): Promise<Customer> => {
  const response = await apiClient.post("/customers", payload);
  return response.data.data;
};

export const updateCustomer = async (
  id: string,
  payload: Partial<CreateCustomerPayload>,
): Promise<Customer> => {
  const response = await apiClient.patch(`/customers/${id}`, payload);
  return response.data.data;
};
