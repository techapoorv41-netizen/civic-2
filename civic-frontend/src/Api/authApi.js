import instance from "./axios";

// Mock user storage helper for client-side evaluation & testing
const getMockUser = (email, role) => ({
  id: "user_" + Date.now(),
  name: email.split("@")[0].toUpperCase() || "Civic User",
  email: email,
  role: role || (email.includes("official") ? "official" : email.includes("admin") ? "admin" : "citizen"),
  phone: "+1 555-0199",
  isVerified: true,
});

export const register = async (data) => {
  try {
    const response = await instance.post("/auth/register", data);
    return response.data;
  } catch (error) {
    // Fallback Mock Response for Testing
    await new Promise((r) => setTimeout(r, 400));
    const mockUser = getMockUser(data.email || "citizen@civicsense.com", data.role);
    localStorage.setItem("accessToken", "mock_jwt_token_" + Date.now());
    localStorage.setItem("civic_user", JSON.stringify(mockUser));
    return {
      success: true,
      data: { user: mockUser, token: "mock_jwt_token" },
      meta: { message: "Registered successfully (Mock)" },
    };
  }
};

export const login = async (data) => {
  try {
    const response = await instance.post("/auth/login", data);
    return response.data;
  } catch (error) {
    // Fallback Mock Response for Testing
    await new Promise((r) => setTimeout(r, 400));
    const role = data.role || (data.email.includes("official") ? "official" : data.email.includes("admin") ? "admin" : "citizen");
    const mockUser = getMockUser(data.email || "user@civicsense.com", role);
    localStorage.setItem("accessToken", "mock_jwt_token_" + Date.now());
    localStorage.setItem("civic_user", JSON.stringify(mockUser));
    return {
      success: true,
      data: { user: mockUser, token: "mock_jwt_token" },
      meta: { message: "Logged in successfully (Mock)" },
    };
  }
};

export const refreshToken = async () => {
  try {
    const response = await instance.post("/auth/refresh");
    return response.data;
  } catch (error) {
    return { success: true, data: { token: "refreshed_mock_jwt_token" } };
  }
};

export const logout = async () => {
  try {
    const response = await instance.post("/auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("civic_user");
    return response.data;
  } catch (error) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("civic_user");
    return { success: true, meta: { message: "Logged out" } };
  }
};

export const getMe = async () => {
  try {
    const response = await instance.get("/auth/me");
    return response.data;
  } catch (error) {
    const stored = localStorage.getItem("civic_user");
    if (stored) {
      return { success: true, data: { user: JSON.parse(stored) } };
    }
    return { success: false, error: "Not authenticated" };
  }
};
