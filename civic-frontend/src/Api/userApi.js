import instance from "./axios";

export const getUserById = async (id) => {
  const response = await instance.get(`/users/${id}`);
  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await instance.patch("/users/me", data);
  return response.data;
};

export const getAllUsers = async (filters = {}) => {
  const response = await instance.get("/users", { params: filters });
  return response.data;
};

export const createOfficialProfile = async (data) => {
  const response = await instance.post("/officials", data);
  return response.data;
};

export const getAllOfficials = async (filters = {}) => {
  const response = await instance.get("/officials", { params: filters });
  return response.data;
};

export const getOfficialById = async (id) => {
  const response = await instance.get(`/officials/${id}`);
  return response.data;
};

export const verifyOfficial = async (id) => {
  const response = await instance.patch(`/officials/${id}/verify`);
  return response.data;
};

export const blockUser = async (id, data = {}) => {
  const response = await instance.patch(`/admin/users/${id}/block`, data);
  return response.data;
};

export const unblockUser = async (id) => {
  const response = await instance.patch(`/admin/users/${id}/unblock`);
  return response.data;
};

export const getAdminActions = async (filters = {}) => {
  const response = await instance.get("/admin/actions", { params: filters });
  return response.data;
};