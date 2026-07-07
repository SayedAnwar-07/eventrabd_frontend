import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

let isRefreshing = false;
let refreshSubscribers = [];

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const redirectToLogin = () => {
  window.location.href = "/login";
};

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// ── Request Interceptor ─────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle JSON and FormData automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// ── Response Interceptor ────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Avoid refresh loop
    if (originalRequest.url?.includes("/users/token/refresh/")) {
      clearAuthStorage();
      redirectToLogin();

      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        clearAuthStorage();
        redirectToLogin();

        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Queue requests while refreshing
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
        const response = await axios.post(
          `${baseURL}/users/token/refresh/`,
          {
            refresh: refreshToken,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const newAccessToken = response.data.access;

        const newRefreshToken = response.data.refresh;

        localStorage.setItem("accessToken", newAccessToken);

        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        isRefreshing = false;

        onRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        onRefreshed(null);

        clearAuthStorage();

        redirectToLogin();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
