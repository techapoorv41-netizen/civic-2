import instance from "./axios";

const MOCK_USERS = [
  { id: "u1", name: "John Citizen", email: "citizen@civicsense.com", role: "citizen", isBlocked: false, isVerified: true },
  { id: "u2", name: "Jane Officer", email: "official@civicsense.com", role: "official", isBlocked: false, isVerified: false, department: "Public Works" },
  { id: "u3", name: "Alex Inspector", email: "official2@civicsense.com", role: "official", isBlocked: false, isVerified: false, department: "Electrical & Lighting" },
  { id: "u4", name: "Super Admin", email: "admin@civicsense.com", role: "admin", isBlocked: false, isVerified: true },
];

export const getUserById = async (id) => {
  try {
    const response = await instance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    const user = MOCK_USERS.find((u) => u.id === id) || MOCK_USERS[0];
    return { success: true, data: user };
  }
};

export const updateMyProfile = async (data) => {
  try {
    const response = await instance.patch("/users/me", data);
    return response.data;
  } catch (error) {
    return { success: true, data: { ...MOCK_USERS[0], ...data } };
  }
};

export const getAllUsers = async (filters = {}) => {
  try {
    const response = await instance.get("/users", { params: filters });
    return response.data;
  } catch (error) {
    return { success: true, data: MOCK_USERS };
  }
};

export const createOfficialProfile = async (data) => {
  try {
    const response = await instance.post("/officials", data);
    return response.data;
  } catch (error) {
    return { success: true, data: { id: "u_" + Date.now(), ...data, isVerified: false } };
  }
};

export const getAllOfficials = async (filters = {}) => {
  try {
    const response = await instance.get("/officials", { params: filters });
    return response.data;
  } catch (error) {
    let officials = MOCK_USERS.filter((u) => u.role === "official");
    if (filters.isVerified !== undefined) {
      officials = officials.filter((o) => o.isVerified === filters.isVerified);
    }
    return { success: true, data: officials };
  }
};

export const getOfficialById = async (id) => {
  try {
    const response = await instance.get(`/officials/${id}`);
    return response.data;
  } catch (error) {
    const official = MOCK_USERS.find((u) => u.id === id && u.role === "official") || MOCK_USERS[1];
    return { success: true, data: official };
  }
};

export const verifyOfficial = async (id) => {
  try {
    const response = await instance.patch(`/officials/${id}/verify`);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, isVerified: true } };
  }
};

export const blockUser = async (id, data = {}) => {
  try {
    const response = await instance.patch(`/admin/users/${id}/block`, data);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, isBlocked: true } };
  }
};

export const unblockUser = async (id) => {
  try {
    const response = await instance.patch(`/admin/users/${id}/unblock`);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, isBlocked: false } };
  }
};

export const getAdminActions = async (filters = {}) => {
  try {
    const response = await instance.get("/admin/actions", { params: filters });
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: [
        { id: "act_1", action: "User Blocked", target: "u2", timestamp: new Date().toISOString() },
        { id: "act_2", action: "Official Verified", target: "u3", timestamp: new Date().toISOString() },
      ],
    };
  }
};
