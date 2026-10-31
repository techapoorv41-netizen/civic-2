import instance from "./axios";

// login/register/refresh के बाद tokens और user localStorage में रखो
const saveSession = (data) => {
  if (data?.accessToken) localStorage.setItem("accessToken", data.accessToken);
  if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
  if (data?.user) localStorage.setItem("civic_user", JSON.stringify(data.user));
};

const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("civic_user");
};

export const register = async (data) => {
  const response = await instance.post("/auth/register", data);
  saveSession(response.data.data);
  return response.data;
};

export const login = async (data) => {
  const response = await instance.post("/auth/login", data);
  saveSession(response.data.data);
  return response.data;
};

export const refreshToken = async () => {
  const response = await instance.post("/auth/refresh", {
    refreshToken: localStorage.getItem("refreshToken"),
  });
  saveSession(response.data.data);
  return response.data;
};

export const logout = async () => {
  try {
    const response = await instance.post("/auth/logout", {
      refreshToken: localStorage.getItem("refreshToken"),
    });
    return response.data;
  } catch (error) {
    return { success: true, data: null, meta: null };
  } finally {
    clearSession();
  }
};

export const getMe = async () => {
  const response = await instance.get("/auth/me");
  const user = response.data.data;
  localStorage.setItem("civic_user", JSON.stringify(user));
  // पुराने mock की तरह data.user भी मिले, और सीधे data.id वगैरह भी
  return { ...response.data, data: { ...user, user } };
};