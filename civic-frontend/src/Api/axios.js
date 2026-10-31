import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const instance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// request interceptor: token attach
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ये calls 401 पर refresh नहीं करेंगी (वरना loop बन सकता है)
const SKIP_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh"];

// एक ही समय में कई 401 आएँ तो refresh सिर्फ़ एक बार चलेगा
let refreshing = null;

function forceLogout() {
  localStorage.clear();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

// response interceptor: 401 पर refresh, फिर original request दोबारा
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isSkipped = SKIP_REFRESH.some((p) => original?.url?.includes(p));

    if (status === 401 && original && !original._retry && !isSkipped) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      try {
        if (!refreshing) {
          refreshing = axios
            .post(`${baseURL}/auth/refresh`, { refreshToken })
            .finally(() => {
              refreshing = null;
            });
        }
        const { data } = await refreshing;
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);

        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return instance(original);
      } catch (refreshError) {
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;