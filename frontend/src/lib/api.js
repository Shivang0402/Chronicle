import { decryptEntry, encryptEntry } from "./entryCrypto.js";
import { countWords } from "./journal.js";
import { getEncryptionKey } from "./cryptoSession.js";
import { randomBytes } from "./crypto.utils.js";

const rawBase = import.meta.env.VITE_API_URL || "";
export const API_BASE = rawBase.replace(/\/$/, "");

const buildUrl = (path) => `${API_BASE}/api${path}`;

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, value);
  });

  const query = search.toString();
  return query ? `?${query}` : "";
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function decryptChronicle(data, ownerId) {
  const chronicles = Array.isArray(data?.chronicles) ? data.chronicles : null;
  const chronicle = data?.chronicle;
  const entries = chronicles || (chronicle ? [chronicle] : []);
  const encryptedEntries = entries.filter((entry) => entry?.encrypted || entry?.encryptedPayload);
  if (!encryptedEntries.length) return data;

  const masterKey = getEncryptionKey(ownerId);
  if (!masterKey) throw new ApiError("Unlock encryption to read your entries.", 423);

  const decryptOne = async (entry) => {
    if (!entry?.encryptedPayload || !entry?._id || !entry?.date) {
      throw new ApiError("An encrypted entry has an invalid envelope.", 422);
    }
    const payload = await decryptEntry(masterKey, entry.encryptedPayload, {
      ownerId,
      entryId: String(entry._id),
      date: new Date(entry.date).toISOString(),
    });
    return { ...entry, ...payload };
  };

  const decrypted = await Promise.all(entries.map((entry) =>
    entry?.encrypted || entry?.encryptedPayload ? decryptOne(entry) : entry,
  ));
  return chronicles
    ? { ...data, chronicles: decrypted }
    : { ...data, chronicle: decrypted[0] };
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Could not reach the Chronicle server. Please make sure it is running.",
      0,
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new ApiError(
      data?.message || "Something went wrong. Please try again.",
      response.status,
      data,
    );
  }

  return data;
}

export const authApi = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload }),

  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  verifyEmail: (token) =>
    request(`/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email) =>
    request("/auth/resend-verification", {
      method: "POST",
      body: { email },
    }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (payload) =>
    request("/auth/reset-password", { method: "POST", body: payload }),

  changePassword: (payload, token) =>
    request("/auth/change-password", {
      method: "PATCH",
      body: payload,
      token,
    }),

  getProfile: (token) => request("/auth/profile", { token }),

  deleteAccount: (token) =>
    request("/auth/account", { method: "DELETE", token }),
};

export const e2eeApi = {
  getMetadata: (token) => request("/e2ee/metadata", { token }),

  setInitialMetadata: (metadata, token) =>
    request("/e2ee/metadata", { method: "POST", body: metadata, token }),

  updateMetadata: (metadata, expectedRevision, token) =>
    request("/e2ee/metadata", {
      method: "PUT",
      body: { ...metadata, expectedRevision },
      token,
    }),
};

export const chronicleApi = {
  getStats: (token, params) =>
    request(`/chronicle/stats${buildQuery(params)}`, { token }),
  getChronicles: async (token, params, ownerId) =>
    decryptChronicle(await request(`/chronicle/getchronicles${buildQuery(params)}`, { token }), ownerId),
  getEntry: async (id, token, ownerId) => {
    const data = await request(`/chronicle/${id}`, { token });
    const entry = data?.chronicle;
    if (entry?.encrypted || entry?.encryptedPayload) {
      const masterKey = getEncryptionKey(ownerId);
      if (!masterKey) throw new ApiError("Unlock encryption to edit this entry.", 423);
      if (!entry?.encryptedPayload || !entry?._id || !entry?.date) {
        throw new ApiError("An encrypted entry has an invalid envelope.", 422);
      }
      const payload = await decryptEntry(masterKey, entry.encryptedPayload, {
        ownerId,
        entryId: String(entry._id),
        date: new Date(entry.date).toISOString(),
      });
      return { ...data, chronicle: { ...entry, ...payload } };
    }
    return data;
  },
  createEntry: async (payload, token, ownerId) => {
    const masterKey = getEncryptionKey(ownerId);
    if (!masterKey) {
      const metadata = await e2eeApi.getMetadata(token);
      if (metadata.configured) {
        throw new ApiError("Unlock encryption before creating an entry.", 423);
      }
      return request("/chronicle", { method: "POST", body: payload, token });
    }

    const entryId = Array.from(randomBytes(12), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const date = payload.date ? new Date(payload.date).toISOString() : new Date().toISOString();
    const privateFields = {
      title: typeof payload.title === "string" ? payload.title : "",
      content: payload.content,
      wordCount: countWords(payload.content || ""),
      ...(typeof payload.mood === "string" ? { mood: payload.mood } : {}),
      ...(Array.isArray(payload.tags) ? { tags: payload.tags } : {}),
    };
    const encryptedPayload = await encryptEntry(masterKey, privateFields, {
      ownerId,
      entryId,
      date,
    });
    const body = {
      _id: entryId,
      date,
      encryptedPayload,
    };
    const data = await request("/chronicle", { method: "POST", body, token });
    const chronicle = data?.chronicle;
    const decryptedPayload = await decryptEntry(masterKey, chronicle.encryptedPayload, {
      ownerId,
      entryId: String(chronicle._id),
      date: new Date(chronicle.date).toISOString(),
    });
    return { ...data, chronicle: { ...chronicle, ...decryptedPayload } };
  },
  updateEntry: async (id, payload, token, ownerId, entryDate, encrypted = false) => {
    if (!encrypted) {
      return request(`/chronicle/${id}`, { method: "PATCH", body: payload, token });
    }

    const masterKey = getEncryptionKey(ownerId);
    if (!masterKey) throw new ApiError("Unlock encryption to update this entry.", 423);
    const date = new Date(entryDate).toISOString();
    const privateFields = {
      title: typeof payload.title === "string" ? payload.title : "",
      content: payload.content,
      wordCount: countWords(payload.content || ""),
      ...(typeof payload.mood === "string" ? { mood: payload.mood } : {}),
      ...(Array.isArray(payload.tags) ? { tags: payload.tags } : {}),
    };
    const encryptedPayload = await encryptEntry(masterKey, privateFields, {
      ownerId,
      entryId: String(id),
      date,
    });
    const data = await request(`/chronicle/${id}`, {
      method: "PATCH",
      body: { encryptedPayload },
      token,
    });
    const chronicle = data?.chronicle;
    const decryptedPayload = await decryptEntry(masterKey, chronicle.encryptedPayload, {
      ownerId,
      entryId: String(chronicle._id),
      date: new Date(chronicle.date).toISOString(),
    });
    return { ...data, chronicle: { ...chronicle, ...decryptedPayload } };
  },
  deleteEntry: (id, token) =>
    request(`/chronicle/${id}`, { method: "DELETE", token }),
  search: (query, token) =>
    request(`/chronicle/search${buildQuery({ query })}`, { token }),
  getMoods: (token) => request("/chronicle/moods", { token }),
  getTags: (token) => request("/chronicle/tags", { token }),
  uploadImage: async (file, token) => {
    const body = new FormData();
    body.append("image", file);

    const response = await fetch(buildUrl("/upload"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new ApiError(
        data?.message || "Could not upload this image.",
        response.status,
        data,
      );
    }

    return data;
  },
  exportEntries: async (token, params = {}) => {
    const response = await fetch(
      buildUrl(`/chronicle/export${buildQuery(params)}`),
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!response.ok) {
      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      throw new ApiError(
        data?.message || "Could not export your chronicles.",
        response.status,
        data,
      );
    }

    return response.blob();
  },
};
