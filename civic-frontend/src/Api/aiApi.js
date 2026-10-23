import instance from "./axios";

/**
 * CivicSense AI API Client
 * Connects directly to backend AI analysis and chatbot endpoints
 */

export const generateAnalysis = async (issueId) => {
  try {
    const response = await instance.post(`/issues/${issueId}/ai-analysis`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "AI Analysis unavailable",
    };
  }
};

export const getAnalysis = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/ai-analysis`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load analysis",
    };
  }
};

export const sendBotPrompt = async (issueId, data) => {
  try {
    const response = await instance.post(`/issues/${issueId}/ai-responses`, data);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "AI Bot unavailable",
    };
  }
};

export const getBotHistory = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/ai-responses`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || "Failed to load bot history",
      data: [],
    };
  }
};
