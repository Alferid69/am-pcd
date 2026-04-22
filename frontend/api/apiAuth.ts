import api from "@/lib/api";

export const login = async ({ username, password }: { username: string; password: string }) => {
  const response = await api.post("/users/login", { username, password });
  return response.data;
};
