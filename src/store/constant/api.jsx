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

// Auth client (no interceptor)
const authClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Runtime state
let csrfToken = null;
let csrfRequestPromise = null;
let refreshRequestPromise = null;

// Access token only in memory
let accessToken = null;

const getAccessToken = () => accessToken;

const saveAccessToken = (token) => {
  accessToken = token;
};

const clearAuthStorage = () => {
  accessToken = null;

  localStorage.removeItem("user");
};

// Remove old refresh token storage
try {
  localStorage.removeItem("refreshToken");
} catch (error) {
  console.warn("Unable to clear old refresh token:", error);
}

// Redirect helper
const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

// HTTP methods
const SAFE_METHODS = new Set(["get", "head", "options"]);

const isUnsafeMethod = (method = "get") => {
  return !SAFE_METHODS.has(method.toLowerCase());
};

// Header helpers
const removeContentType = (headers) => {
  if (!headers) return;

  if (typeof headers.delete === "function") {
    headers.delete("Content-Type");

    return;
  }

  delete headers["Content-Type"];
};

const setHeader = (headers, name, value) => {
  if (typeof headers.set === "function") {
    headers.set(name, value);

    return;
  }

  headers[name] = value;
};

// CSRF token
const requestCsrfToken = async (forceRefresh = false) => {
  if (csrfToken && !forceRefresh) {
    return csrfToken;
  }

  if (csrfRequestPromise && !forceRefresh) {
    return csrfRequestPromise;
  }

  csrfRequestPromise = authClient
    .get("/users/csrf/")
    .then((response) => {
      const token = response.data?.csrfToken;

      if (!token) {
        throw new Error("CSRF token missing");
      }

      csrfToken = token;

      return token;
    })
    .finally(() => {
      csrfRequestPromise = null;
    });

  return csrfRequestPromise;
};

// CLIENT refresh token
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

const refreshAccessToken = async () => {
  let csrf = await requestCsrfToken();

  let response;

  try {
    response = await performRefreshRequest(csrf);
  } catch (error) {
    if (error.response?.status !== 403) {
      throw error;
    }

    csrfToken = null;

    csrf = await requestCsrfToken(true);

    response = await performRefreshRequest(csrf);
  }

  const newToken = response.data?.access;

  if (!newToken) {
    throw new Error("Access token missing");
  }

  saveAccessToken(newToken);

  return newToken;
};

// Attach token + csrf
api.interceptors.request.use(async (config) => {
  config.headers = config.headers ?? {};

  const token = getAccessToken();

  if (token && !config.headers.Authorization) {
    setHeader(config.headers, "Authorization", `Bearer ${token}`);
  }

  if (isUnsafeMethod(config.method) && !config._skipCsrf) {
    const csrf = await requestCsrfToken();

    setHeader(config.headers, "X-CSRFToken", csrf);
  }

  const isFormData = config.data instanceof FormData;

  if (isFormData) {
    removeContentType(config.headers);
  } else if (config.data !== undefined && config.data !== null) {
    setHeader(config.headers, "Content-Type", "application/json");
  }

  return config;
});

// Paths without refresh
const REFRESH_EXCLUDED_PATHS = [
  "/users/csrf/",

  "/users/login/",

  "/users/amar-admin/login/",

  "/users/register/",

  "/users/verify-otp/",

  "/users/forgot-password/",

  "/users/reset-password/",

  "/users/token/refresh/",

  "/users/amar-admin/token/refresh/",
];

const shouldSkipRefresh = (url = "") => {
  return REFRESH_EXCLUDED_PATHS.some((path) => url.includes(path));
};

// Refresh on 401
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response.status === 403 &&
      isUnsafeMethod(originalRequest.method)
    ) {
      csrfToken = null;
    }

    if (
      error.response.status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequestPromise) {
        refreshRequestPromise = refreshAccessToken().finally(() => {
          refreshRequestPromise = null;
        });
      }

      const newToken = await refreshRequestPromise;

      originalRequest.headers = originalRequest.headers ?? {};

      setHeader(originalRequest.headers, "Authorization", `Bearer ${newToken}`);

      return api(originalRequest);
    } catch (error) {
      clearAuthStorage();

      redirectToLogin();

      return Promise.reject(error);
    }
  },
);

export { saveAccessToken, clearAuthStorage };

export default api;
