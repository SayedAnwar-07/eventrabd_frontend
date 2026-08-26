import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error("VITE_API_URL is not configured.");
}

// Main API client
const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Auth client without interceptors
const authClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Runtime auth state
let accessToken = null;
let csrfToken = null;

let csrfRequestPromise = null;
let refreshRequestPromise = null;

// Access token helpers
export const getAccessToken = () => accessToken;

export const saveAccessToken = (token) => {
  accessToken = typeof token === "string" && token.trim() ? token : null;
};

export const clearAccessToken = () => {
  accessToken = null;
};

// Clear frontend auth data
export const clearAuthStorage = () => {
  clearAccessToken();

  try {
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.warn("Unable to clear auth storage:", error);
  }
};

// Remove old stored refresh token
try {
  localStorage.removeItem("refreshToken");
} catch (error) {
  console.warn("Unable to remove old refresh token:", error);
}

// Redirect to login
const redirectToLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

// HTTP helpers
const SAFE_METHODS = new Set(["get", "head", "options"]);

const isUnsafeMethod = (method = "get") => {
  return !SAFE_METHODS.has(String(method).toLowerCase());
};

// Header helpers
const setHeader = (headers, name, value) => {
  if (!headers) return;

  if (typeof headers.set === "function") {
    headers.set(name, value);
    return;
  }

  headers[name] = value;
};

const removeHeader = (headers, name) => {
  if (!headers) return;

  if (typeof headers.delete === "function") {
    headers.delete(name);
    return;
  }

  delete headers[name];
  delete headers[name.toLowerCase()];
};

// Fetch CSRF token
const fetchCsrfToken = async () => {
  const { data } = await authClient.get("/users/csrf/");

  const token = data?.csrfToken;

  if (typeof token !== "string" || !token.trim()) {
    throw new Error("CSRF token missing.");
  }

  csrfToken = token;

  return token;
};

// Get cached or fresh CSRF
export const requestCsrfToken = async (forceRefresh = false) => {
  if (csrfToken && !forceRefresh) {
    return csrfToken;
  }

  if (csrfRequestPromise && !forceRefresh) {
    return csrfRequestPromise;
  }

  if (forceRefresh) {
    csrfToken = null;
  }

  csrfRequestPromise = fetchCsrfToken();

  try {
    return await csrfRequestPromise;
  } finally {
    csrfRequestPromise = null;
  }
};

export const clearCsrfToken = () => {
  csrfToken = null;
};

// Refresh request
const performRefreshRequest = (csrf) => {
  return authClient.post(
    "/users/token/refresh/",
    {},
    {
      headers: {
        "X-CSRFToken": csrf,
      },
    },
  );
};

// Refresh access token
export const refreshAccessToken = async () => {
  let csrf = await requestCsrfToken();

  let response;

  try {
    response = await performRefreshRequest(csrf);
  } catch (error) {
    if (error.response?.status !== 403) {
      throw error;
    }

    // Retry once with fresh CSRF
    clearCsrfToken();

    csrf = await requestCsrfToken(true);

    response = await performRefreshRequest(csrf);
  }

  const newToken = response.data?.access;

  if (typeof newToken !== "string" || !newToken.trim()) {
    throw new Error("Access token missing.");
  }

  saveAccessToken(newToken);

  return newToken;
};

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers ?? {};

    const token = getAccessToken();

    // Add access token
    if (token && !config.headers.Authorization) {
      setHeader(config.headers, "Authorization", `Bearer ${token}`);
    }

    // Add CSRF for unsafe methods
    if (isUnsafeMethod(config.method) && !config._skipCsrf) {
      const csrf = await requestCsrfToken();

      setHeader(config.headers, "X-CSRFToken", csrf);
    }

    // Handle FormData correctly
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      removeHeader(config.headers, "Content-Type");
    } else if (config.data !== undefined && config.data !== null) {
      setHeader(config.headers, "Content-Type", "application/json");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Do not auto-refresh these paths
const REFRESH_EXCLUDED_PATHS = [
  "/users/csrf/",
  "/users/login/",
  "/users/amar-admin/login/",
  "/users/register/",
  "/users/verify-otp/",
  "/users/forgot-password/",
  "/users/reset-password/",
  "/users/amar-admin/forgot-password/",
  "/users/amar-admin/reset-password/",
  "/users/token/refresh/",
  "/users/amar-admin/token/refresh/",
];

// Get pathname safely
const getRequestPath = (url = "") => {
  try {
    const parsed = new URL(
      url,
      baseURL.endsWith("/") ? baseURL : `${baseURL}/`,
    );

    return parsed.pathname;
  } catch {
    return String(url).split("?")[0];
  }
};

// Check refresh exclusion
const shouldSkipRefresh = (url = "") => {
  const requestPath = getRequestPath(url);

  return REFRESH_EXCLUDED_PATHS.some((path) => requestPath.endsWith(path));
};

// One refresh for multiple 401s
const getFreshAccessToken = async () => {
  if (!refreshRequestPromise) {
    refreshRequestPromise = refreshAccessToken().finally(() => {
      refreshRequestPromise = null;
    });
  }

  return refreshRequestPromise;
};

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Clear stale CSRF cache
    if (status === 403 && isUnsafeMethod(originalRequest.method)) {
      clearCsrfToken();
    }

    // Only 401 triggers refresh
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Skip auth endpoints
    if (shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Prevent retry loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await getFreshAccessToken();

      originalRequest.headers = originalRequest.headers ?? {};

      setHeader(originalRequest.headers, "Authorization", `Bearer ${newToken}`);

      // Retry once
      return api(originalRequest);
    } catch (refreshError) {
      clearAuthStorage();
      clearCsrfToken();

      redirectToLogin();

      return Promise.reject(refreshError);
    }
  },
);

export default api;
