import instance from "./axios";

/**
 * Get notifications for authenticated user
 * @param {Object} [filters={}]
 */
export const getNotifications = async (filters = {}) => {
  const response = await instance.get("/notifications", { params: filters });
  return response.data;
};

/**
 * Mark a single notification as read
 * @param {string} id
 */
export const markAsRead = async (id) => {
  const response = await instance.patch(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all user notifications as read
 */
export const markAllAsRead = async () => {
  const response = await instance.patch("/notifications/read-all");
  return response.data;
};
