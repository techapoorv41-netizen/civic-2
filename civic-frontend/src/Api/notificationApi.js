import instance from "./axios";

export const getNotifications = async (filters = {}) => {
  const response = await instance.get("/notifications", { params: filters });
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await instance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await instance.patch("/notifications/read-all");
  return response.data;
};