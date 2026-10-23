import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const instance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Flag and queue to manage single-flight token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: attach Authorization Bearer token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: single-flight token refresh on 401
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints (login, register, refresh) or if already retried
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      isRefreshing = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("civic_user");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${baseURL}/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data?.data || {};

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        instance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return instance(originalRequest);
      } else {
        throw new Error("No access token returned from refresh");
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("civic_user");
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;
