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

export const chronicleApi = {
  getStats: (token, params) =>
    request(`/chronicle/stats${buildQuery(params)}`, { token }),
  getChronicles: (token, params) =>
    request(`/chronicle/getchronicles${buildQuery(params)}`, { token }),
  getEntry: (id, token) => request(`/chronicle/${id}`, { token }),
  createEntry: (payload, token) =>
    request("/chronicle", { method: "POST", body: payload, token }),
  updateEntry: (id, payload, token) =>
    request(`/chronicle/${id}`, { method: "PATCH", body: payload, token }),
  deleteEntry: (id, token) =>
    request(`/chronicle/${id}`, { method: "DELETE", token }),
  search: (query, token) =>
    request(`/chronicle/search${buildQuery({ query })}`, { token }),
  getMoods: (token) => request("/chronicle/moods", { token }),
  getTags: (token) => request("/chronicle/tags", { token }),
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
