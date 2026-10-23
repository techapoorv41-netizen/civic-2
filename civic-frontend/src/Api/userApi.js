import instance from "./axios";

/**
 * Get user profile by ID
 * @param {string} id
 */
export const getUserById = async (id) => {
  const response = await instance.get(`/users/${id}`);
  return response.data;
};

/**
 * Update authenticated user's profile
 * @param {{ name?: string, phone?: string }} data
 */
export const updateMyProfile = async (data) => {
  const response = await instance.patch("/users/me", data);
  return response.data;
};

/**
 * List all users with optional filters (Admin only)
 * @param {Object} [filters={}]
 */
export const getAllUsers = async (filters = {}) => {
  const response = await instance.get("/users", { params: filters });
  return response.data;
};

/**
 * Create official profile for authenticated official
 * @param {Object} data - { department, designation, employeeId, area }
 */
export const createOfficialProfile = async (data) => {
  const response = await instance.post("/officials", data);
  return response.data;
};

/**
 * List all official profiles with filters (Admin only)
 * @param {Object} [filters={}]
 */
export const getAllOfficials = async (filters = {}) => {
  const response = await instance.get("/officials", { params: filters });
  return response.data;
};

/**
 * Get official profile by ID (Admin or profile owner)
 * @param {string} id
 */
export const getOfficialById = async (id) => {
  const response = await instance.get(`/officials/${id}`);
  return response.data;
};

/**
 * Verify an official profile (Admin only)
 * @param {string} id
 */
export const verifyOfficial = async (id) => {
  const response = await instance.patch(`/officials/${id}/verify`);
  return response.data;
};

/**
 * Block a user account (Admin only)
 * @param {string} id
 * @param {{ reason: string }} data
 */
export const blockUser = async (id, data = {}) => {
  try {
    const payload = typeof data === "string" 
      ? { reason: data } 
      : { reason: data?.reason || "Account suspended by administrator" };
    const response = await instance.patch(`/admin/users/${id}/block`, payload);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to block user",
    };
  }
};

/**
 * Unblock a user account (Admin only)
 * @param {string} id
 */
export const unblockUser = async (id) => {
  try {
    const response = await instance.patch(`/admin/users/${id}/unblock`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to unblock user",
    };
  }
};

/**
 * Retrieve audit action log (Admin only)
 * @param {Object} [filters={}]
 */
export const getAdminActions = async (filters = {}) => {
  try {
    const response = await instance.get("/admin/actions", { params: filters });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to retrieve audit log",
      data: [],
    };
  }
};
