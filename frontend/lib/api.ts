import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// We rely on the `jwt` HttpOnly cookie for authentication.
// `withCredentials: true` ensures cookies are sent.

export default api;