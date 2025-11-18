
let _issues = [
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
  {
    id: 3,
    title: "Sidebar hover issue",
    description: "Hover state flickers on small screens.",
    status: "closed",
    priority: "low",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    attachments: [],
  },
];

let _comments = {
  // issueId: [ { id, author, text, created_at } ]
  1: [
    {
      id: 1,
      author: "Admin",
      text: "Investigating this.",
      created_at: new Date().toISOString(),
    },
  ],
  2: [],
  3: [],
};

let _nextIssueId = 4;
let _nextCommentId = 2;

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const mockIssues = {
  list: async () => {
    await delay(250);
    // return in API-like shape { data: [...] }
    return { data: _issues.slice() };
  },

  create: async (payload) => {
    await delay(250);
    const newIssue = {
      id: _nextIssueId++,
      title: payload.title || "Untitled",
      description: payload.description || "",
      status: payload.status || "open",
      priority: payload.priority || "medium",
      created_at: new Date().toISOString(),
      attachments: [],
    };
    _issues = [newIssue, ..._issues];
    _comments[newIssue.id] = [];
    return { data: newIssue };
  },

  retrieve: async (id) => {
    await delay(200);
    const found = _issues.find((i) => String(i.id) === String(id));
    if (!found) throw new Error("Not found");
    // simulate API shape
    return { data: found };
  },

  update: async (id, payload) => {
    await delay(200);
    _issues = _issues.map((i) =>
      String(i.id) === String(id) ? { ...i, ...payload } : i
    );
    const updated = _issues.find((i) => String(i.id) === String(id));
    return { data: updated };
  },

  delete: async (id) => {
    await delay(200);
    _issues = _issues.filter((i) => String(i.id) !== String(id));
    delete _comments[id];
    return { data: true };
  },

  // COMMENTS
  comments: {
    list: async (issueId) => {
      await delay(200);
      return { data: _comments[issueId] ? [..._comments[issueId]] : [] };
    },
    create: async (issueId, payload) => {
      await delay(200);
      const comment = {
        id: _nextCommentId++,
        author: payload.author || "You",
        text: payload.text || "",
        created_at: new Date().toISOString(),
      };
      _comments[issueId] = _comments[issueId] || [];
      _comments[issueId].push(comment);
      return { data: comment };
    },
  },

  // ATTACHMENTS (very simple mock)
  attachments: {
    upload: async (issueId, file) => {
      await delay(300);
      const att = {
        id: Date.now(),
        filename: file?.name || "file.txt",
        url: "#",
      };
      _issues = _issues.map((i) =>
        String(i.id) === String(issueId)
          ? { ...i, attachments: [...(i.attachments || []), att] }
          : i
      );
      return { data: att };
    },
  },

  // helper to reset (for tests)
  _reset: (state) => {
    if (Array.isArray(state)) _issues = state;
  },
};

export default mockIssues;
