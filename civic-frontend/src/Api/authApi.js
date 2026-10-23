import instance from "./axios";

/**
 * Register a new user (citizen or official)
 * @param {Object} data
 */
export const register = async (data) => {
  const response = await instance.post("/auth/register", data);
  const result = response.data;

  if (result.success && result.data) {
    if (result.data.accessToken) {
      localStorage.setItem("accessToken", result.data.accessToken);
    }
    if (result.data.refreshToken) {
      localStorage.setItem("refreshToken", result.data.refreshToken);
    }
    if (result.data.user) {
      localStorage.setItem("civic_user", JSON.stringify(result.data.user));
    }
  }

  return result;
};

/**
 * Login user
 * @param {Object} data - { email, password }
 */
export const login = async (data) => {
  const response = await instance.post("/auth/login", data);
  const result = response.data;

  if (result.success && result.data) {
    if (result.data.accessToken) {
      localStorage.setItem("accessToken", result.data.accessToken);
    }
    if (result.data.refreshToken) {
      localStorage.setItem("refreshToken", result.data.refreshToken);
    }
    if (result.data.user) {
      localStorage.setItem("civic_user", JSON.stringify(result.data.user));
    }
  }

  return result;
};

/**
 * Refresh tokens
 */
export const refreshToken = async () => {
  const storedRefreshToken = localStorage.getItem("refreshToken");
  if (!storedRefreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await instance.post("/auth/refresh", {
    refreshToken: storedRefreshToken,
  });

  const result = response.data;
  if (result.success && result.data) {
    if (result.data.accessToken) {
      localStorage.setItem("accessToken", result.data.accessToken);
    }
    if (result.data.refreshToken) {
      localStorage.setItem("refreshToken", result.data.refreshToken);
    }
  }

  return result;
};

/**
 * Logout user
 */
export const logout = async () => {
  const storedRefreshToken = localStorage.getItem("refreshToken");
  try {
    const response = await instance.post("/auth/logout", {
      refreshToken: storedRefreshToken || undefined,
    });
    return response.data;
  } finally {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("civic_user");
  }
};

/**
 * Get current authenticated user
 */
export const getMe = async () => {
  const response = await instance.get("/auth/me");
  return response.data;
};
