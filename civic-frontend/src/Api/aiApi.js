import api from './axios';
export const generateAnalysis = async (issueId) => {
  try {
    const response = await api.post(`/issues/${issueId}/ai-analysis`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
export const getAnalysis = async (issueId) => {
  try {
    const response = await api.get(`/issues/${issueId}/ai-analysis`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendBotPrompt = async (issueId, data) => {
  try {
    const response = await api.post(`/issues/${issueId}/ai-responses`, data);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getBotHistory = async (issueId) => {
  try {
    const response = await api.get(`/issues/${issueId}/ai-responses`);
    return response.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};