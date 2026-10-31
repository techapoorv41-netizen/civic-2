import instance from "./axios";

export const generateAnalysis = async (issueId) => {
  const response = await instance.post(`/issues/${issueId}/ai-analysis`);
  return response.data;
};

export const getAnalysis = async (issueId) => {
  const response = await instance.get(`/issues/${issueId}/ai-analysis`);
  return response.data;
};

export const sendBotPrompt = async (issueId, data) => {
  const response = await instance.post(`/issues/${issueId}/ai-responses`, data);
  return response.data;
};

export const getBotHistory = async (issueId, filters = {}) => {
  const response = await instance.get(`/issues/${issueId}/ai-responses`, { params: filters });
  return response.data;
};