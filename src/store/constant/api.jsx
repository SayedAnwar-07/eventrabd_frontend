import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// ── Refresh queue ─────────────────────────────────────────────────────────────
// Holds pending requests while a token refresh is in progress
let isRefreshing = false;
let refreshSubscribers = [];

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
};

// ── Storage helper ────────────────────────────────────────────────────────────
const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Attaches the Bearer token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────────
// On 401, silently refreshes the access token and retries the original request.
// Queues any concurrent requests until the refresh completes.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        clearAuthStorage();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(
          `${baseURL}/users/token/refresh/`,
          { refresh: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          },
        );

        const newAccess = res.data.access;
        const newRefresh = res.data.refresh;

        localStorage.setItem("accessToken", newAccess);
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);

        isRefreshing = false;
        onRefreshed(newAccess);

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        clearAuthStorage();
        onRefreshed(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
