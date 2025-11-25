
import mockIssues from "./mockIssues.js";

export const notificationsApi = {
  list: async () => {
    return await mockIssues.notifications.list();
  },
  markRead: async (id) => {
    return await mockIssues.notifications.markRead(id);
  },
  markAllRead: async () => {
    return await mockIssues.notifications.markAllRead();
  },
};
