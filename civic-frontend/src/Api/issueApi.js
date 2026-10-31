import instance from "./axios";

export const getIssues = async (filters = {}) => {
  const response = await instance.get("/issues", { params: filters });
  return response.data;
};

export const getIssueById = async (id) => {
  const response = await instance.get(`/issues/${id}`);
  return response.data;
};

export const createIssue = async (data) => {
  const response = await instance.post("/issues", data);
  return response.data;
};

export const updateIssue = async (id, data) => {
  const response = await instance.patch(`/issues/${id}`, data);
  return response.data;
};

export const deleteIssue = async (id) => {
  const response = await instance.delete(`/issues/${id}`);
  return response.data;
};

export const verifyIssue = async (id) => {
  const response = await instance.patch(`/issues/${id}/verify`);
  return response.data;
};

export const getIssueHistory = async (issueId) => {
  const response = await instance.get(`/issues/${issueId}/history`);
  return response.data;
};

// officialId = official ki User id (profile id nahi)
export const assignIssue = async (issueId, data) => {
  const response = await instance.post(`/issues/${issueId}/assign`, data);
  return response.data;
};

export const getMyAssignments = async (filters = {}) => {
  const response = await instance.get("/assignments/mine", { params: filters });
  return response.data;
};

export const acceptAssignment = async (id) => {
  const response = await instance.patch(`/assignments/${id}/accept`);
  return response.data;
};

export const completeAssignment = async (id, data = {}) => {
  const response = await instance.patch(`/assignments/${id}/complete`, data);
  return response.data;
};

export const rejectAssignment = async (id, data = {}) => {
  const response = await instance.patch(`/assignments/${id}/reject`, data);
  return response.data;
};

export const addComment = async (issueId, data) => {
  const response = await instance.post(`/issues/${issueId}/comments`, data);
  return response.data;
};

export const getComments = async (issueId, filters = {}) => {
  const response = await instance.get(`/issues/${issueId}/comments`, { params: filters });
  return response.data;
};

export const getCategories = async () => {
  const response = await instance.get("/categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await instance.post("/categories", data);
  return response.data;
};

export const uploadAttachment = async (issueId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await instance.post(`/issues/${issueId}/attachments`, formData, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
};

export const getAttachments = async (issueId) => {
  const response = await instance.get(`/issues/${issueId}/attachments`);
  return response.data;
};