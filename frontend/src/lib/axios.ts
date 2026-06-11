import axios from "axios";
import type { ApiResponse } from "../types/api";

let tokenGetter: () => string | null = () => null;
let unauthorizedHandler: () => void = () => undefined;

export function registerAuthAccessors(getToken: () => string | null, onUnauthorized: () => void) {
  tokenGetter = getToken;
  unauthorizedHandler = onUnauthorized;
}

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = tokenGetter();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      unauthorizedHandler();
    }
    return Promise.reject(error);
  }
);

export function unwrap<T>(response: { data: ApiResponse<T> }) {
  if (!response.data.success) {
    throw new Error(response.data.message ?? "요청 처리에 실패했습니다.");
  }
  return response.data.data;
}
