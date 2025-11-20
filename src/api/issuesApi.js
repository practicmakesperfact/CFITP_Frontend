
import mockIssues from "./mockIssues.js";

const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

export const issuesApi = {
  // List all issues (for client: only their own later)
  list: async (params = {}) => {
    await delay();
    const result = await mockIssues.list();
    return result; // { data: [...] }
  },

  // Create newi issue
  create: async (payload) => {
    await delay(800);
    const result = await mockIssues.create(payload);

    // Show success toast (optional, but nice)
    if (typeof window !== "undefined") {
      const toast = await import("react-hot-toast").then((m) => m.default);
      toast.success("Issue submitted successfully!");
    }

    return result;
  },

  retrieve: async (id) => {
    await delay();
    return mockIssues.retrieve(id);
  },

  update: async (id, payload) => {
    await delay();
    return mockIssues.update(id, payload);
  },

  // Not needed for client MVP
  assign: () => {},
  transition: () => {},
  delete: () => {},
};
