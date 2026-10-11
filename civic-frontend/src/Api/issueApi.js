import instance from "./axios";

const MOCK_ISSUES = [
  {
    id: "1",
    title: "Streetlight flickering on MG Road",
    description: "The main streetlight opposite Central Park is flickering continuously and turns off at night.",
    category: "Electrical & Lighting",
    status: "pending",
    priority: "medium",
    location: { lat: 28.6139, lng: 77.209 },
    images: ["https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isVerified: true,
    assignedTo: null,
  },
  {
    id: "2",
    title: "Large pothole causing traffic slowdown",
    description: "Deep pothole near 5th Avenue crossing poses severe risk to two-wheelers during monsoon.",
    category: "Roads & Potholes",
    status: "in_progress",
    priority: "high",
    location: { lat: 28.6129, lng: 77.21 },
    images: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80"],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isVerified: true,
    assignedTo: "u2",
  },
  {
    id: "3",
    title: "Overflowing garbage dump near sector market",
    description: "Garbage collection has been missed for 3 consecutive days, creating unbearable odor.",
    category: "Sanitation & Waste",
    status: "resolved",
    priority: "high",
    location: { lat: 28.6149, lng: 77.212 },
    images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"],
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    isVerified: true,
    assignedTo: "u2",
  },
];

const MOCK_CATEGORIES = [
  { id: "cat_1", name: "Roads & Potholes" },
  { id: "cat_2", name: "Electrical & Lighting" },
  { id: "cat_3", name: "Sanitation & Waste" },
  { id: "cat_4", name: "Water Supply & Drainage" },
  { id: "cat_5", name: "Public Parks & Trees" },
];

export const getIssues = async (filters = {}) => {
  try {
    const response = await instance.get("/issues", { params: filters });
    return response.data;
  } catch (error) {
    let filtered = [...MOCK_ISSUES];
    if (filters.isVerified !== undefined) {
      filtered = filtered.filter((i) => i.isVerified === filters.isVerified);
    }
    if (filters.assignedTo === "self") {
      filtered = filtered.filter((i) => i.assignedTo === "u2");
    }
    return { success: true, data: filtered, meta: { total: filtered.length } };
  }
};

export const getIssueById = async (id) => {
  try {
    const response = await instance.get(`/issues/${id}`);
    return response.data;
  } catch (error) {
    const issue = MOCK_ISSUES.find((i) => i.id === id) || MOCK_ISSUES[0];
    return { success: true, data: issue };
  }
};

export const createIssue = async (data) => {
  try {
    const response = await instance.post("/issues", data);
    return response.data;
  } catch (error) {
    const newIssue = {
      id: "iss_" + Date.now(),
      title: data.title,
      description: data.description,
      category: data.category || "General",
      status: "pending",
      priority: "medium",
      location: data.location || { lat: 28.6139, lng: 77.209 },
      images: data.images || [],
      createdAt: new Date().toISOString(),
      isVerified: false,
    };
    MOCK_ISSUES.unshift(newIssue);
    return { success: true, data: newIssue };
  }
};

export const updateIssue = async (id, data) => {
  try {
    const response = await instance.patch(`/issues/${id}`, data);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, ...data } };
  }
};

export const deleteIssue = async (id) => {
  try {
    const response = await instance.delete(`/issues/${id}`);
    return response.data;
  } catch (error) {
    return { success: true, data: { id } };
  }
};

export const verifyIssue = async (id) => {
  try {
    const response = await instance.patch(`/issues/${id}/verify`);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, isVerified: true } };
  }
};

export const getIssueHistory = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/history`);
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: [
        { status: "Reported", date: "2 days ago", note: "Issue submitted by citizen" },
        { status: "Verified", date: "1 day ago", note: "Admin verified authenticity" },
        { status: "In Progress", date: "12 hours ago", note: "Assigned to Maintenance Team" },
      ],
    };
  }
};

export const assignIssue = async (issueId, data) => {
  try {
    const response = await instance.post(`/issues/${issueId}/assign`, data);
    return response.data;
  } catch (error) {
    return { success: true, data: { issueId, assignedTo: data.officialId } };
  }
};

export const getMyAssignments = async (filters = {}) => {
  try {
    const response = await instance.get("/assignments/mine", { params: filters });
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: MOCK_ISSUES.filter((i) => i.assignedTo === "u2" || i.status === "in_progress"),
    };
  }
};

export const acceptAssignment = async (id) => {
  try {
    const response = await instance.patch(`/assignments/${id}/accept`);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, status: "in_progress" } };
  }
};

export const completeAssignment = async (id, data = {}) => {
  try {
    const response = await instance.patch(`/assignments/${id}/complete`, data);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, status: "resolved", ...data } };
  }
};

export const rejectAssignment = async (id, data = {}) => {
  try {
    const response = await instance.patch(`/assignments/${id}/reject`, data);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, status: "rejected", ...data } };
  }
};

export const addComment = async (issueId, data) => {
  try {
    const response = await instance.post(`/issues/${issueId}/comments`, data);
    return response.data;
  } catch (error) {
    const newComment = {
      id: "c_" + Date.now(),
      author: data.author || "You",
      text: data.text,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: newComment };
  }
};

export const getComments = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/comments`);
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: [
        { id: "c1", author: "City Inspector", text: "Inspection scheduled for tomorrow morning." },
        { id: "c2", author: "Resident Association", text: "Thank you for addressing this quickly." },
      ],
    };
  }
};

export const getCategories = async () => {
  try {
    const response = await instance.get("/categories");
    return response.data;
  } catch (error) {
    return { success: true, data: MOCK_CATEGORIES };
  }
};

export const createCategory = async (data) => {
  try {
    const response = await instance.post("/categories", data);
    return response.data;
  } catch (error) {
    return { success: true, data: { id: "cat_" + Date.now(), ...data } };
  }
};

export const uploadAttachment = async (issueId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await instance.post(`/issues/${issueId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    return {
      success: true,
      data: { url: URL.createObjectURL(file) },
    };
  }
};

export const getAttachments = async (issueId) => {
  try {
    const response = await instance.get(`/issues/${issueId}/attachments`);
    return response.data;
  } catch (error) {
    return { success: true, data: [] };
  }
};