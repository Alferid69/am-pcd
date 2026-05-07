import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url: string = error.config?.url || "";
      const isSessionCheck = url.includes("/users/me");
      // Redirect to login only for actual API failures, not the initial session probe
      if (
        !isSessionCheck &&
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/forgot-password"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// We rely on the `jwt` HttpOnly cookie for authentication.
// `withCredentials: true` ensures cookies are sent.

export default api;