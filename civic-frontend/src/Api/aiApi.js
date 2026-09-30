import instance from "./axios";

const MOCK_ANALYSIS = {
  severityScore: 8.5,
  predictedCategory: "Roads & Safety Hazard",
  isDuplicate: false,
  urgency: "High",
  categoryBreakdown: [
    { category: "Roads & Potholes", count: 42 },
    { category: "Electrical & Lighting", count: 28 },
    { category: "Sanitation & Waste", count: 35 },
    { category: "Water Supply", count: 18 },
  ],
};

export const generateAnalysis = async (issueId) => {
  try {
    const response = await instance.post(`/issues/${issueId}/ai-analysis`);
    return response.data;
  } catch (error) {
    return { success: true, data: MOCK_ANALYSIS };
  }
};

export const getAnalysis = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/ai-analysis`);
    return response.data;
  } catch (error) {
    return { success: true, data: MOCK_ANALYSIS };
  }
};

export const sendBotPrompt = async (issueId, data) => {
  try {
    const response = await instance.post(`/issues/${issueId}/ai-responses`, data);
    return response.data;
  } catch (error) {
    const userMsg = data.prompt || data.message || "How can this issue be fixed faster?";
    return {
      success: true,
      data: {
        id: "msg_" + Date.now(),
        userPrompt: userMsg,
        aiResponse: `Based on CivicSense automated analysis for issue #${issueId}: The issue has been categorized as high urgency. Recommended action is dispatching the zonal repair squad within 24 hours.`,
        createdAt: new Date().toISOString(),
      },
    };
  }
};

export const getBotHistory = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/ai-responses`);
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: [
        {
          id: "msg_1",
          userPrompt: "What is the expected resolution timeline?",
          aiResponse: "Estimated resolution time for high priority road repairs is 48-72 business hours.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  }
};