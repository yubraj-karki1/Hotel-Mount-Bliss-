import axios from "axios";
export const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api", timeout: 15_000, headers: { "Content-Type": "application/json" }, withCredentials: true });
apiClient.interceptors.response.use((response) => response, (error: unknown) => Promise.reject(error));
