// src/api/mockIssues.js
const STORAGE = {
  ISSUES: "cfitp_issues",
  COMMENTS: "cfitp_comments",
  NOTIFICATIONS: "cfitp_notifications",
  NEXT_ID: "cfitp_nextid",
};

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

const get = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const init = () => {
  if (!get(STORAGE.ISSUES)) set(STORAGE.ISSUES, []);
  if (!get(STORAGE.COMMENTS)) set(STORAGE.COMMENTS, {});
  if (!get(STORAGE.NOTIFICATIONS)) set(STORAGE.NOTIFICATIONS, []);
  if (!get(STORAGE.NEXT_ID))
    set(STORAGE.NEXT_ID, { issue: 1, comment: 1, attachment: 1, notif: 1 });
};
init();

/**
 * Add a notification to localStorage with optional role target.
 * role can be "manager", "staff", "client" or null (broadcast)
 */
const addNotification = (message, role = null) => {
  const notifs = get(STORAGE.NOTIFICATIONS, []);
  const next = get(STORAGE.NEXT_ID);
  const n = {
    id: next.notif++,
    message,
    role,
    read: false,
    created_at: new Date().toISOString(),
  };
  notifs.unshift(n);
  set(STORAGE.NOTIFICATIONS, notifs);
  set(STORAGE.NEXT_ID, next);
  // Also set a small "signal" to help UI components detect updates
  localStorage.setItem("__cfitp_notif_signal__", Date.now());
};

const mockIssues = {
  // list issues
  list: async (params = {}) => {
    await delay();
    const issues = get(STORAGE.ISSUES, []);
    // Simple filtering by assignee if asked
    if (params.assignee === "me") {
      const me = JSON.parse(localStorage.getItem("user_profile") || "{}");
      return { data: issues.filter((i) => i.assignee_email === me.email) };
    }
    return { data: issues.sort((a, b) => b.id - a.id) };
  },

  // create new issue (payload: { title, description, priority, created_by, created_by_name, attachments })
  create: async (payload) => {
    await delay(400);
    const issues = get(STORAGE.ISSUES, []);
    const next = get(STORAGE.NEXT_ID);
    const newIssue = {
      id: next.issue++,
      title: payload.title,
      description: payload.description,
      priority: payload.priority || "medium",
      status: payload.status || "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: payload.created_by || "client@cfitp.com",
      created_by_name:
        payload.created_by_name || payload.created_by || "Client",
      assignee_name: payload.assignee_name || null,
      assignee_email: payload.assignee_email || null,
      attachments: payload.attachments || [],
      comments_count: 0,
      tags: payload.tags || [],
      due_date: payload.due_date || null,
    };
    issues.unshift(newIssue);
    set(STORAGE.ISSUES, issues);
    set(STORAGE.NEXT_ID, next);

    // notify managers
    addNotification(`New issue created: "${newIssue.title}"`, "manager");

    return { data: newIssue };
  },

  // retrieve issue detail
  retrieve: async (id) => {
    await delay(200);
    const issues = get(STORAGE.ISSUES, []);
    const issue = issues.find((i) => Number(i.id) === Number(id));
    if (!issue) throw new Error("Issue not found");
    const comments = get(STORAGE.COMMENTS, {})[issue.id] || [];
    return { data: { ...issue, comments } };
  },

  // update issue (generic)
  update: async (id, payload) => {
    await delay(200);
    const issues = get(STORAGE.ISSUES, []);
    const updated = issues.map((i) =>
      Number(i.id) === Number(id)
        ? { ...i, ...payload, updated_at: new Date().toISOString() }
        : i
    );
    set(STORAGE.ISSUES, updated);

    const issue = updated.find((i) => Number(i.id) === Number(id));

    // notifications based on change
    if (payload.status) {
      if (payload.status === "in-progress") {
        addNotification(
          `Issue #${id} started by ${issue.assignee_name || "Staff"}`,
          "client"
        );
      } else if (payload.status === "resolved") {
        addNotification(
          `Issue #${id} resolved by ${issue.assignee_name || "Staff"}`,
          "client"
        );
      } else if (payload.status === "closed") {
        addNotification(`Issue #${id} closed`, "client");
      } else if (payload.status === "open") {
        addNotification(`Issue #${id} reopened`, "client");
      }
    }

    if (payload.assignee_name || payload.assignee_email) {
      // notify the staff assigned
      addNotification(`You have been assigned to issue #${id}`, "staff");
    }

    return { data: issue };
  },

  // assign staff (manager)
  assign: async (id, { assignee_name, assignee_email }) => {
    await delay(200);
    return mockIssues.update(id, { assignee_name, assignee_email });
  },

  // transition / status helper (staff)
  transition: async (id, status) => {
    await delay(200);
    return mockIssues.update(id, { status });
  },

  // attachments: simple base64 store, returns attachment entry
  attachments: {
    upload: async (issueId, file) => {
      await delay(400);
      const issues = get(STORAGE.ISSUES, []);
      const issue = issues.find((i) => Number(i.id) === Number(issueId));
      if (!issue) throw new Error("Issue not found");
      const next = get(STORAGE.NEXT_ID);

      // If file is File object, convert to base64
      const readFileAsBase64 = (f) =>
        new Promise((res, rej) => {
          if (!f) return rej("No file");
          // if it's already a base64 string, just return
          if (typeof f === "string" && f.startsWith("data:")) return res(f);
          const reader = new FileReader();
          reader.onload = () => res(reader.result);
          reader.onerror = (e) => rej(e);
          reader.readAsDataURL(f);
        });

      const base64 =
        typeof file === "string" ? file : await readFileAsBase64(file);

      const att = {
        id: next.attachment++,
        filename: file.name || `attachment-${Date.now()}`,
        url: base64,
        uploaded_at: new Date().toISOString(),
      };

      issue.attachments = issue.attachments || [];
      issue.attachments.push(att);

      // write back
      const all = issues.map((i) => (i.id === issue.id ? issue : i));
      set(STORAGE.ISSUES, all);
      set(STORAGE.NEXT_ID, next);

      addNotification(`New attachment added to issue #${issueId}`, "staff");

      return { data: att };
    },
  },

  // comments (create, list)
  comments: {
    list: async (issueId) => {
      await delay(200);
      const comments = get(STORAGE.COMMENTS, {});
      return { data: comments[issueId] || [] };
    },

    create: async (issueId, { content, author, attachments = [] }) => {
      await delay(300);
      const comments = get(STORAGE.COMMENTS, {});
      const next = get(STORAGE.NEXT_ID);
      const comment = {
        id: next.comment++,
        author:
          author ||
          JSON.parse(localStorage.getItem("user_profile") || "{}").first_name ||
          "User",
        content,
        attachments,
        created_at: new Date().toISOString(),
      };
      comments[issueId] = comments[issueId] || [];
      comments[issueId].push(comment);
      set(STORAGE.COMMENTS, comments);
      set(STORAGE.NEXT_ID, next);

      // bump comment count on issue
      const issues = get(STORAGE.ISSUES, []);
      const updated = issues.map((i) =>
        Number(i.id) === Number(issueId)
          ? { ...i, comments_count: (i.comments_count || 0) + 1 }
          : i
      );
      set(STORAGE.ISSUES, updated);

      // notify relevant users (simple heuristic)
      const authorProfile = JSON.parse(
        localStorage.getItem("user_profile") || "{}"
      );
      const roleToNotify =
        authorProfile.role === "client" ? "manager" : "client";
      addNotification(`New comment on issue #${issueId}`, roleToNotify);

      return { data: comment };
    },
  },

  // notifications list
  notifications: {
    list: async () => {
      await delay(120);
      return { data: get(STORAGE.NOTIFICATIONS, []) };
    },

    markRead: async (id) => {
      await delay(80);
      const notifs = get(STORAGE.NOTIFICATIONS, []);
      const updated = notifs.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      set(STORAGE.NOTIFICATIONS, updated);
      return { data: { success: true } };
    },
  },

  // helper to expose addNotification for UI components
  addNotification,
};

export default mockIssues;
