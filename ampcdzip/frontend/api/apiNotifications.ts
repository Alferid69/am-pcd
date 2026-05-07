import apiClient from "../lib/api";

export interface Notification {
  _id: string;
  stockRequest: any; // We can expand this later
  targetRole: string;
  targetOfficeId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const fetchUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get("/notifications?isRead=false");
  return response.data.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await apiClient.patch(`/notifications/${id}`, {
    isRead: true,
  });
  return response.data.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.patch("/notifications/markAllAsRead");
  return response.data;
};
