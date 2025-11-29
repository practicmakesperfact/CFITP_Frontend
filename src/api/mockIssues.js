
// const STORAGE = {
//   ISSUES: "cfitp_issues",
//   COMMENTS: "cfitp_comments",
//   NOTIFICATIONS: "cfitp_notifications",
//   NEXT_ID: "cfitp_nextid",
// };

// const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));

// /* Helpers to read/write localStorage safely */
// const _get = (key, fallback) => {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : fallback;
//   } catch {
//     return fallback;
//   }
// };
// const _set = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// const init = () => {
//   if (!_get(STORAGE.ISSUES, null)) _set(STORAGE.ISSUES, []);
//   if (!_get(STORAGE.COMMENTS, null)) _set(STORAGE.COMMENTS, {});
//   if (!_get(STORAGE.NOTIFICATIONS, null)) _set(STORAGE.NOTIFICATIONS, []);
//   if (!_get(STORAGE.NEXT_ID, null))
//     _set(STORAGE.NEXT_ID, { issue: 1, comment: 1, attachment: 1, notif: 1 });
// };
// init();

// /**
//  * Emit a small storage signal used by UI components to detect changes
//  * (useful for same-tab updates where 'storage' event isn't fired).
//  */
// const emitSignal = (key = "__cfitp_signal__") => {
//   try {
//     localStorage.setItem(key, Date.now().toString());
//   } catch {}
// };

// /* Notification helper */
// /**
//  * message: string
//  * role: null (broadcast) | "manager" | "staff" | "client" | "admin"
//  */
// const addNotification = (message, role = null) => {
//   const notifs = _get(STORAGE.NOTIFICATIONS, []);
//   const next = _get(STORAGE.NEXT_ID, {});
//   const n = {
//     id: next.notif++,
//     message,
//     role,
//     read: false,
//     created_at: new Date().toISOString(),
//   };
//   notifs.unshift(n);
//   _set(STORAGE.NOTIFICATIONS, notifs);
//   _set(STORAGE.NEXT_ID, next);
//   emitSignal("__cfitp_notif_signal__");
// };

// const canonicalStatuses = ["open", "in-progress", "resolved", "closed"];

// const mockIssues = {
//   // === Issues ===
//   list: async (params = {}) => {
//     await delay();
//     let issues = _get(STORAGE.ISSUES, []);
//     // simple param support: assignee="me"
//     if (params.assignee === "me") {
//       const me = JSON.parse(localStorage.getItem("user_profile") || "{}");
//       issues = issues.filter((i) => i.assignee_email === me.email);
//     }
//     // allow filter by status/priority if passed
//     if (params.status) {
//       issues = issues.filter((i) => i.status === params.status);
//     }
//     if (params.created_by) {
//       issues = issues.filter((i) => i.created_by === params.created_by);
//     }
//     // return newest first
//     return { data: issues.slice().sort((a, b) => b.id - a.id) };
//   },

//   create: async (payload) => {
//     await delay(300);
//     const issues = _get(STORAGE.ISSUES, []);
//     const next = _get(STORAGE.NEXT_ID, {});
//     const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");

//     const status = payload.status || "open";
//     const newIssue = {
//       id: next.issue++,
//       title: payload.title,
//       description: payload.description,
//       priority: payload.priority || "medium",
//       status: canonicalStatuses.includes(status) ? status : "open",
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//       created_by: payload.created_by || profile.email || "client@cfitp.com",
//       created_by_name:
//         payload.created_by_name ||
//         profile.first_name ||
//         profile.email ||
//         "Client",
//       assignee_name: payload.assignee_name || null,
//       assignee_email: payload.assignee_email || null,
//       attachments: payload.attachments || [],
//       comments_count: 0,
//       tags: payload.tags || [],
//       due_date: payload.due_date || null,
//     };

//     issues.unshift(newIssue);
//     _set(STORAGE.ISSUES, issues);
//     _set(STORAGE.NEXT_ID, next);

//     // Notify manager(s) that a new issue was created
//     addNotification(`New issue created: "${newIssue.title}"`, "manager");

//     emitSignal();
//     return { data: newIssue };
//   },

//   retrieve: async (id) => {
//     await delay(120);
//     const issues = _get(STORAGE.ISSUES, []);
//     const issue = issues.find((i) => Number(i.id) === Number(id));
//     if (!issue) throw new Error("Issue not found");
//     const comments = _get(STORAGE.COMMENTS, {})[issue.id] || [];
//     return { data: { ...issue, comments } };
//   },

//   update: async (id, payload) => {
//     await delay(120);
//     const issues = _get(STORAGE.ISSUES, []);
//     let found = null;
//     const updated = issues.map((i) => {
//       if (Number(i.id) !== Number(id)) return i;
//       found = { ...i, ...payload, updated_at: new Date().toISOString() };
//       return found;
//     });
//     _set(STORAGE.ISSUES, updated);
//     // produce notifications based on changes
//     if (found) {
//       if (payload.status) {
//         const s = payload.status;
//         if (s === "in-progress")
//           addNotification(
//             `Issue #${id} started by ${found.assignee_name || "Staff"}`,
//             "client"
//           );
//         if (s === "resolved")
//           addNotification(
//             `Issue #${id} resolved by ${found.assignee_name || "Staff"}`,
//             "client"
//           );
//         if (s === "closed") addNotification(`Issue #${id} closed`, "client");
//         if (s === "open") addNotification(`Issue #${id} reopened`, "client");
//       }
//       if (payload.assignee_name || payload.assignee_email) {
//         addNotification(`You have been assigned to issue #${id}`, "staff");
//       }
//     }
//     emitSignal();
//     return { data: found };
//   },

//   assign: async (id, { assignee_name, assignee_email }) => {
//     return mockIssues.update(id, { assignee_name, assignee_email });
//   },

//   transition: async (id, status) => {
//     const normalized = canonicalStatuses.includes(status) ? status : status;
//     return mockIssues.update(id, { status: normalized });
//   },

//   delete: async (id) => {
//     await delay(120);
//     const issues = _get(STORAGE.ISSUES, []);
//     const filtered = issues.filter((i) => Number(i.id) !== Number(id));
//     _set(STORAGE.ISSUES, filtered);
//     emitSignal();
//     return { data: { success: true } };
//   },

//   // === Attachments ===
//   attachments: {
//     upload: async (issueId, file) => {
//       await delay(250);
//       const issues = _get(STORAGE.ISSUES, []);
//       const issue = issues.find((i) => Number(i.id) === Number(issueId));
//       if (!issue) throw new Error("Issue not found");

//       // File may be a File object (browser) or a data URL string (already converted)
//       const readFile = (f) =>
//         new Promise((res, rej) => {
//           if (!f) return rej("No file");
//           if (typeof f === "string" && f.startsWith("data:")) return res(f);
//           const reader = new FileReader();
//           reader.onload = () => res(reader.result);
//           reader.onerror = (e) => rej(e);
//           reader.readAsDataURL(f);
//         });

//       const url = typeof file === "string" ? file : await readFile(file);

//       const next = _get(STORAGE.NEXT_ID, {});
//       const att = {
//         id: next.attachment++,
//         filename: file.name || `attachment-${Date.now()}`,
//         url,
//         uploaded_at: new Date().toISOString(),
//       };

//       issue.attachments = issue.attachments || [];
//       issue.attachments.push(att);

//       const all = issues.map((i) => (i.id === issue.id ? issue : i));
//       _set(STORAGE.ISSUES, all);
//       _set(STORAGE.NEXT_ID, next);

//       addNotification(`New attachment added to issue #${issueId}`, null);
//       emitSignal();
//       return { data: att };
//     },
//   },

//   // === Comments ===
//   comments: {
//     list: async (issueId) => {
//       await delay(120);
//       const comments = _get(STORAGE.COMMENTS, {});
//       return { data: comments[issueId] || [] };
//     },

//     create: async (issueId, { content, author, attachments = [] }) => {
//       await delay(180);
//       const comments = _get(STORAGE.COMMENTS, {});
//       const next = _get(STORAGE.NEXT_ID, {});
//       const comment = {
//         id: next.comment++,
//         author:
//           author ||
//           JSON.parse(localStorage.getItem("user_profile") || "{}").first_name ||
//           "User",
//         content,
//         attachments,
//         created_at: new Date().toISOString(),
//       };
//       comments[issueId] = comments[issueId] || [];
//       comments[issueId].push(comment);
//       _set(STORAGE.COMMENTS, comments);
//       // bump comment_count in issue
//       const issues = _get(STORAGE.ISSUES, []);
//       const updated = issues.map((i) =>
//         Number(i.id) === Number(issueId)
//           ? { ...i, comments_count: (i.comments_count || 0) + 1 }
//           : i
//       );
//       _set(STORAGE.ISSUES, updated);
//       _set(STORAGE.NEXT_ID, next);

//       // notify relevant role: if commenter is client -> notify manager, else notify client
//       const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");
//       const roleToNotify = profile.role === "client" ? "manager" : "client";
//       addNotification(`New comment on issue #${issueId}`, roleToNotify);

//       emitSignal();
//       return { data: comment };
//     },

//     update: async (issueId, commentId, payload) => {
//       await delay(120);
//       const comments = _get(STORAGE.COMMENTS, {});
//       const list = comments[issueId] || [];
//       const updated = list.map((c) =>
//         Number(c.id) === Number(commentId) ? { ...c, ...payload } : c
//       );
//       comments[issueId] = updated;
//       _set(STORAGE.COMMENTS, comments);
//       emitSignal();
//       return { data: updated.find((c) => c.id === commentId) };
//     },

//     delete: async (issueId, commentId) => {
//       await delay(120);
//       const comments = _get(STORAGE.COMMENTS, {});
//       comments[issueId] = (comments[issueId] || []).filter(
//         (c) => Number(c.id) !== Number(commentId)
//       );
//       _set(STORAGE.COMMENTS, comments);
//       emitSignal();
//       return { data: { success: true } };
//     },
//   },

//   // === Notifications ===
//   notifications: {
//     list: async () => {
//       await delay(90);
//       return { data: _get(STORAGE.NOTIFICATIONS, []) };
//     },
//     markRead: async (id) => {
//       await delay(60);
//       const notifs = _get(STORAGE.NOTIFICATIONS, []);
//       const updated = notifs.map((n) =>
//         n.id === id ? { ...n, read: true } : n
//       );
//       _set(STORAGE.NOTIFICATIONS, updated);
//       emitSignal("__cfitp_notif_signal__");
//       return { data: { success: true } };
//     },
//     markAllRead: async () => {
//       await delay(60);
//       const notifs = _get(STORAGE.NOTIFICATIONS, []);
//       const updated = notifs.map((n) => ({ ...n, read: true }));
//       _set(STORAGE.NOTIFICATIONS, updated);
//       emitSignal("__cfitp_notif_signal__");
//       return { data: { success: true } };
//     },
//   },

//   // small helper (exported) to add programmatic notifications
//   addNotification,
// };

// export default mockIssues;
