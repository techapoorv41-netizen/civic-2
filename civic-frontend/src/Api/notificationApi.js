import instance from "./axios";

const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    title: "Issue Status Updated",
    message: "Your reported issue 'Streetlight flickering on MG Road' is now In Progress.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    link: "/citizen/issue/1",
  },
  {
    id: "n2",
    title: "New Official Assignment",
    message: "You have been assigned to investigate 'Large pothole near 5th Avenue'.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    link: "/official/handle-reports",
  },
  {
    id: "n3",
    title: "AI Analysis Complete",
    message: "AI severity analysis report is available for report #2.",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    link: "/citizen/issue/2/analysis",
  },
];

export const getNotifications = async (filters = {}) => {
  try {
    const response = await instance.get("/notifications", { params: filters });
    return response.data;
  } catch (error) {
    return { success: true, data: MOCK_NOTIFICATIONS };
  }
};

export const markAsRead = async (id) => {
  try {
    const response = await instance.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    return { success: true, data: { id, isRead: true } };
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await instance.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    return { success: true, meta: { message: "All notifications marked as read" } };
  }
};
