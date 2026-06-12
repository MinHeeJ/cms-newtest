import axios from "axios";

export const TOKEN_KEY = "cms-token";

export const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
};

export function unwrap<T>(response: { data: ApiResponse<T> }) {
  if (!response.data.success) {
    throw new Error(response.data.error?.message ?? "요청 처리 중 오류가 발생했습니다.");
  }
  return response.data.data;
}
