import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("VITE_API_URL is not configured.");
}

// Main API instance used throughout the application.
const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Separate clean client.
// It has no interceptors, preventing refresh loops.
const authClient = axios.create({
  baseURL,
  withCredentials: true,
});

// ── Runtime state ─────────────────────────────────────────────────────────────

let csrfToken = null;
let csrfRequestPromise = null;
let refreshRequestPromise = null;

// ── Storage helpers ───────────────────────────────────────────────────────────

const getAccessToken = () => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

const saveAccessToken = (accessToken) => {
  try {
    localStorage.setItem("accessToken", accessToken);

    // Delete refresh tokens saved by the old implementation.
    localStorage.removeItem("refreshToken");
  } catch {
    // Ignore browser storage errors.
  }
};

const clearAuthStorage = () => {
  try {
    localStorage.removeItem("accessToken");

    localStorage.removeItem("refreshToken");

    localStorage.removeItem("user");
  } catch {
    // Ignore browser storage errors.
  }
};

// Remove legacy refresh-token storage immediately.
try {
  localStorage.removeItem("refreshToken");
} catch {
  // Ignore browser storage errors.
}

// ── Navigation helper ─────────────────────────────────────────────────────────

const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

// ── Request helpers ───────────────────────────────────────────────────────────

const SAFE_METHODS = new Set(["get", "head", "options"]);

const isUnsafeMethod = (method = "get") => {
  return !SAFE_METHODS.has(method.toLowerCase());
};

const removeContentType = (headers) => {
  if (!headers) {
    return;
  }

  if (typeof headers.delete === "function") {
    headers.delete("Content-Type");
    return;
  }

  delete headers["Content-Type"];
};

const setHeader = (headers, headerName, value) => {
  if (typeof headers.set === "function") {
    headers.set(headerName, value);

    return;
  }

  headers[headerName] = value;
};

// ── CSRF handling ─────────────────────────────────────────────────────────────

const requestCsrfToken = async (forceRefresh = false) => {
  if (csrfToken && !forceRefresh) {
    return csrfToken;
  }

  if (csrfRequestPromise && !forceRefresh) {
    return csrfRequestPromise;
  }

  csrfRequestPromise = authClient
    .get("/users/csrf/", {
      headers: {
        "Cache-Control": "no-cache",
      },
    })
    .then((response) => {
      const receivedToken = response.data?.csrfToken;

      if (!receivedToken) {
        throw new Error("CSRF token was not returned by the server.");
      }

      csrfToken = receivedToken;

      return receivedToken;
    })
    .finally(() => {
      csrfRequestPromise = null;
    });

  return csrfRequestPromise;
};

// ── Refresh-token handling ────────────────────────────────────────────────────

const performRefreshRequest = async (currentCsrfToken) => {
  return authClient.post(
    "/users/token/refresh/",
    {},
    {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": currentCsrfToken,
      },
    },
  );
};

const refreshAccessToken = async () => {
  let currentCsrfToken = await requestCsrfToken();

  let response;

  try {
    response = await performRefreshRequest(currentCsrfToken);
  } catch (error) {
    // A stale CSRF token can produce 403.
    // Fetch a fresh token and retry once.
    if (error.response?.status !== 403) {
      throw error;
    }

    csrfToken = null;

    currentCsrfToken = await requestCsrfToken(true);

    response = await performRefreshRequest(currentCsrfToken);
  }

  const newAccessToken = response.data?.access;

  if (!newAccessToken) {
    throw new Error("The refresh endpoint did not return an access token.");
  }

  saveAccessToken(newAccessToken);

  return newAccessToken;
};

// ── Request interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers ?? {};

    const accessToken = getAccessToken();

    if (accessToken && !config.headers.Authorization) {
      setHeader(config.headers, "Authorization", `Bearer ${accessToken}`);
    }

    if (isUnsafeMethod(config.method) && !config._skipCsrf) {
      const currentCsrfToken = await requestCsrfToken();

      setHeader(config.headers, "X-CSRFToken", currentCsrfToken);
    }

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      // Browser must create the multipart boundary.
      removeContentType(config.headers);
    } else if (config.data !== undefined && config.data !== null) {
      setHeader(config.headers, "Content-Type", "application/json");
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────────

const REFRESH_EXCLUDED_PATHS = [
  "/users/csrf/",
  "/users/login/",
  "/users/amar-admin/login/",
  "/users/register/",
  "/users/verify-otp/",
  "/users/forgot-password/",
  "/users/reset-password/",
  "/users/token/refresh/",
];

const shouldSkipRefresh = (url = "") => {
  return REFRESH_EXCLUDED_PATHS.some((path) => url.includes(path));
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Clear cached CSRF token after a CSRF rejection.
    if (status === 403 && isUnsafeMethod(originalRequest.method)) {
      csrfToken = null;
    }

    if (
      status !== 401 ||
      originalRequest._retry ||
      originalRequest._skipAuthRefresh ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Every failed request waits for the same refresh operation.
      if (!refreshRequestPromise) {
        refreshRequestPromise = refreshAccessToken().finally(() => {
          refreshRequestPromise = null;
        });
      }

      const newAccessToken = await refreshRequestPromise;

      originalRequest.headers = originalRequest.headers ?? {};

      setHeader(
        originalRequest.headers,
        "Authorization",
        `Bearer ${newAccessToken}`,
      );

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      redirectToLogin();

      return Promise.reject(refreshError);
    }
  },
);

export default api;
