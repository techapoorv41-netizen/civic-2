import instance from "./axios";

/**
 * CivicSense Issue API Client
 * Integrated directly with backend API contracts
 */

export const getIssues = async (filters = {}) => {
  try {
    const response = await instance.get("/issues", { params: filters });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load issues",
      details: error.response?.data?.error?.details || [],
    };
  }
};

export const getIssueById = async (id) => {
  try {
    const response = await instance.get(`/issues/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Issue not found",
    };
  }
};

export const createIssue = async (data) => {
  try {
    const response = await instance.post("/issues", data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to create issue",
      details: error.response?.data?.error?.details || [],
    };
  }
};

export const updateIssue = async (id, data) => {
  try {
    const response = await instance.patch(`/issues/${id}`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to update issue",
    };
  }
};

export const deleteIssue = async (id) => {
  try {
    const response = await instance.delete(`/issues/${id}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to delete issue",
    };
  }
};

export const verifyIssue = async (id) => {
  try {
    const response = await instance.patch(`/issues/${id}/verify`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to verify issue",
    };
  }
};

export const getIssueHistory = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/history`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load history",
      data: [],
    };
  }
};

export const assignIssue = async (issueId, data) => {
  try {
    const response = await instance.post(`/issues/${issueId}/assign`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to assign issue",
    };
  }
};

export const getMyAssignments = async (filters = {}) => {
  try {
    const response = await instance.get("/assignments/mine", { params: filters });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load assignments",
      data: [],
    };
  }
};

export const acceptAssignment = async (id) => {
  try {
    const response = await instance.patch(`/assignments/${id}/accept`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to accept assignment",
    };
  }
};

export const completeAssignment = async (id, data = {}) => {
  try {
    const response = await instance.patch(`/assignments/${id}/complete`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to complete assignment",
    };
  }
};

export const rejectAssignment = async (id, data = {}) => {
  try {
    const response = await instance.patch(`/assignments/${id}/reject`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to reject assignment",
    };
  }
};

export const addComment = async (issueId, data) => {
  try {
    const response = await instance.post(`/issues/${issueId}/comments`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to post comment",
    };
  }
};

export const getComments = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/comments`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load comments",
      data: [],
    };
  }
};

export const getCategories = async () => {
  try {
    const response = await instance.get("/categories");
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load categories",
      data: [],
    };
  }
};

export const createCategory = async (data) => {
  try {
    const response = await instance.post("/categories", data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to create category",
    };
  }
};

export const uploadAttachment = async (issueId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // Expected form field named 'file' per D13
    const response = await instance.post(`/issues/${issueId}/attachments`, formData, {
      headers: { "Content-Type": undefined }, // Allow browser to set boundary
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Upload failed",
    };
  }
};

export const getAttachments = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/attachments`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load attachments",
      data: [],
    };
  }
};
