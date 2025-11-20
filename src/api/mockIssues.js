
const STORAGE_KEYS = {
  ISSUES: "cf_issues_v1",
  COMMENTS: "cf_comments_v1",
  NEXT_IDS: "cf_nextids_v1",
};

const defaultIssues = [
  {
    id: 1,
    title: "User can't login",
    description: "Login form returns 500 error for some users.",
    status: "open",
    priority: "high",
    created_at: new Date().toISOString(),
    attachments: [],
  },
  {
    id: 2,
    title: "Dashboard slow",
    description: "Dashboard takes >5s to load charts on large datasets.",
    status: "in-progress",
    priority: "medium",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    attachments: [],
  },
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage write failed", e);
  }
}

function initStorage() {
  const issues = readJSON(STORAGE_KEYS.ISSUES, null);
  const comments = readJSON(STORAGE_KEYS.COMMENTS, null);
  const next = readJSON(STORAGE_KEYS.NEXT_IDS, null);

  if (!issues) writeJSON(STORAGE_KEYS.ISSUES, defaultIssues);
  if (!comments) {
    // default comment for issue 1
    const c = {
      1: [
        {
          id: 1,
          author: "Admin",
          content: "Investigating this issue.",
          created_at: new Date().toISOString(),
        },
      ],
    };
    writeJSON(STORAGE_KEYS.COMMENTS, c);
  }
  if (!next)
    writeJSON(STORAGE_KEYS.NEXT_IDS, {
      issue: 3,
      comment: 2,
      attachment: Date.now(),
    });
}

initStorage();

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));

const mockIssues = {
  list: async () => {
    await delay();
    const issues = readJSON(STORAGE_KEYS.ISSUES, []);
    // return API-like shape
    return {
      data: issues
        .slice()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    };
  },

  create: async (payload) => {
    await delay();
    const issues = readJSON(STORAGE_KEYS.ISSUES, []);
    const next = readJSON(STORAGE_KEYS.NEXT_IDS, {
      issue: 1,
      comment: 1,
      attachment: Date.now(),
    });
    const newIssue = {
      id: next.issue++,
      title: payload.title || "Untitled",
      description: payload.description || "",
      status: payload.status || "open",
      priority: payload.priority || "medium",
      created_at: new Date().toISOString(),
      attachments: [],
    };
    issues.unshift(newIssue);
    writeJSON(STORAGE_KEYS.ISSUES, issues);
    writeJSON(STORAGE_KEYS.NEXT_IDS, next);
    // ensure comments container
    const comments = readJSON(STORAGE_KEYS.COMMENTS, {});
    comments[newIssue.id] = comments[newIssue.id] || [];
    writeJSON(STORAGE_KEYS.COMMENTS, comments);

    return { data: newIssue };
  },

  retrieve: async (id) => {
    await delay();
    const issues = readJSON(STORAGE_KEYS.ISSUES, []);
    const found = issues.find((i) => String(i.id) === String(id));
    if (!found) throw new Error("Not found");
    return { data: found };
  },

  update: async (id, payload) => {
    await delay();
    let issues = readJSON(STORAGE_KEYS.ISSUES, []);
    issues = issues.map((i) =>
      String(i.id) === String(id) ? { ...i, ...payload } : i
    );
    writeJSON(STORAGE_KEYS.ISSUES, issues);
    const updated = issues.find((i) => String(i.id) === String(id));
    return { data: updated };
  },

  delete: async (id) => {
    await delay();
    let issues = readJSON(STORAGE_KEYS.ISSUES, []);
    issues = issues.filter((i) => String(i.id) !== String(id));
    writeJSON(STORAGE_KEYS.ISSUES, issues);
    const comments = readJSON(STORAGE_KEYS.COMMENTS, {});
    delete comments[id];
    writeJSON(STORAGE_KEYS.COMMENTS, comments);
    return { data: true };
  },

  comments: {
    list: async (issueId) => {
      await delay();
      const comments = readJSON(STORAGE_KEYS.COMMENTS, {});
      return { data: comments[issueId] ? [...comments[issueId]] : [] };
    },

    create: async (issueId, payload) => {
      await delay();
      const comments = readJSON(STORAGE_KEYS.COMMENTS, {});
      const next = readJSON(STORAGE_KEYS.NEXT_IDS, {
        issue: 1,
        comment: 1,
        attachment: Date.now(),
      });
      const comment = {
        id: next.comment++,
        author: payload.author || "You",
        content: payload.content || "",
        created_at: new Date().toISOString(),
      };
      comments[issueId] = comments[issueId] || [];
      comments[issueId].push(comment); // push => we'll reverse when displaying so newest on top
      writeJSON(STORAGE_KEYS.COMMENTS, comments);
      writeJSON(STORAGE_KEYS.NEXT_IDS, next);
      return { data: comment };
    },
  },

  attachments: {
    upload: async (issueId, file) => {
      await delay(300);
      const issues = readJSON(STORAGE_KEYS.ISSUES, []);
      const next = readJSON(STORAGE_KEYS.NEXT_IDS, {
        issue: 1,
        comment: 1,
        attachment: Date.now(),
      });

      const att = {
        id: next.attachment++,
        filename: file?.name || `file-${Date.now()}`,
        url: "#", // front-end only
        created_at: new Date().toISOString(),
      };

      const updated = issues.map((i) =>
        String(i.id) === String(issueId)
          ? { ...i, attachments: [...(i.attachments || []), att] }
          : i
      );

      writeJSON(STORAGE_KEYS.ISSUES, updated);
      writeJSON(STORAGE_KEYS.NEXT_IDS, next);
      return { data: att };
    },
  },

  // helper: reset (dev)
  _reset: (stateIssues = null, stateComments = null) => {
    if (stateIssues) writeJSON(STORAGE_KEYS.ISSUES, stateIssues);
    if (stateComments) writeJSON(STORAGE_KEYS.COMMENTS, stateComments);
  },
};

export default mockIssues;
