import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api, { clearAuthStorage, saveAccessToken } from "@/store/constant/api";

import { connectWebSocket } from "@/websocket/websocketClient";
import getApiErrorMessage from "@/store/constant/getApiErrorMessage";

// Get stored user only
const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");

    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

// Save user only
const saveUser = (user) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));

    // Remove old implementation
    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.warn("Unable to save user session:", error);
  }
};

// Clear local user data
const clearSession = () => {
  clearAuthStorage();
};

// Remove old refresh token
try {
  localStorage.removeItem("refreshToken");
} catch (error) {
  console.warn("Unable to remove old refresh token:", error);
}

// =========================================================
// Register
// =========================================================

export const registerUser = createAsyncThunk(
  "auth/register",

  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/register/", userData);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// Verify OTP
// =========================================================

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",

  async (otpData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/verify-otp/", otpData);

      const access = data?.access;

      if (!access) {
        throw new Error("Access token missing from verify response.");
      }

      // Sync Axios runtime token
      saveAccessToken(access);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// Login
// =========================================================

export const loginUser = createAsyncThunk(
  "auth/login",

  async (loginData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/login/", loginData);

      const access = data?.access;

      if (!access) {
        throw new Error("Access token missing from login response.");
      }

      // Sync Axios runtime token
      saveAccessToken(access);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// Restore session
// =========================================================

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",

  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/token/refresh/", {});

      const access = data?.access;

      if (!access) {
        throw new Error("Access token missing from refresh response.");
      }

      // Restore Axios runtime token
      saveAccessToken(access);

      return data;
    } catch (error) {
      clearAuthStorage();

      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// My profile
// =========================================================

export const getMyProfile = createAsyncThunk(
  "auth/getMyProfile",

  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/me/");

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// Update profile
// =========================================================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",

  async ({ slug, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${slug}/settings/`, updateData);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// Forgot password
// =========================================================

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",

  async (emailData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/forgot-password/", emailData);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// Reset password
// =========================================================

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",

  async (passwordData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/reset-password/", passwordData);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// Logout current device
// =========================================================

export const logoutUser = createAsyncThunk(
  "auth/logout",

  async () => {
    try {
      await api.post("/users/logout/", {});
    } finally {
      clearAuthStorage();
    }
  },
);

// =========================================================
// Logout all devices
// =========================================================

export const logoutAll = createAsyncThunk(
  "auth/logoutAll",

  async () => {
    try {
      await api.post("/users/logout/all/", {});
    } finally {
      clearAuthStorage();
    }
  },
);

// =========================================================
// Initial state
// =========================================================

const initialState = {
  user: getStoredUser(),

  // Redux mirror only
  accessToken: null,

  // Refresh token is HttpOnly cookie only
  refreshToken: null,

  // Must restore first after reload
  isAuthenticated: false,

  authInitialized: false,

  loading: false,
  error: null,
  success: false,

  forgotSuccess: false,
  resetSuccess: false,
};

// =========================================================
// Shared reducers
// =========================================================

const setPending = (state) => {
  state.loading = true;
  state.error = null;
  state.success = false;
};

const setRejected = (state, action) => {
  state.loading = false;

  state.error = action.payload ?? {
    message: "An unexpected error occurred.",
  };
};

const setLoggedOut = (state) => {
  state.user = null;

  state.accessToken = null;
  state.refreshToken = null;

  state.isAuthenticated = false;
  state.authInitialized = true;

  state.loading = false;
  state.error = null;
  state.success = false;

  state.forgotSuccess = false;
  state.resetSuccess = false;

  clearSession();
};

// =========================================================
// Slice
// =========================================================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearLocalSession: setLoggedOut,

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = false;
      state.forgotSuccess = false;
      state.resetSuccess = false;
    },

    // Use only when runtime token is also synced
    setAccessToken: (state, action) => {
      const access = action.payload;

      saveAccessToken(access);

      state.accessToken = access ?? null;

      state.isAuthenticated = Boolean(access);
    },
  },

  extraReducers: (builder) => {
    builder

      // Register
      .addCase(registerUser.pending, setPending)
      .addCase(registerUser.rejected, setRejected)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, setPending)
      .addCase(verifyOtp.rejected, (state, action) => {
        setRejected(state, action);

        state.isAuthenticated = false;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        const { access, user } = action.payload;

        state.loading = false;
        state.success = true;

        state.user = user;
        state.accessToken = access;

        state.refreshToken = null;

        state.isAuthenticated = true;

        state.authInitialized = true;

        saveUser(user);

        connectWebSocket(access);
      })

      // Login
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.rejected, (state, action) => {
        setRejected(state, action);

        state.isAuthenticated = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { access, user } = action.payload;

        state.loading = false;
        state.success = true;

        state.user = user;
        state.accessToken = access;

        state.refreshToken = null;

        state.isAuthenticated = true;

        state.authInitialized = true;

        saveUser(user);

        connectWebSocket(access);
      })

      // Restore session
      .addCase(restoreSession.pending, (state) => {
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        const access = action.payload?.access;

        state.accessToken = access;

        state.isAuthenticated = true;

        // Profile still needs to be verified.
        state.authInitialized = false;

        state.error = null;

        connectWebSocket(access);
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;

        state.accessToken = null;

        state.refreshToken = null;

        state.isAuthenticated = false;

        state.authInitialized = true;

        state.loading = false;
      })

      // Get profile
      .addCase(getMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.loading = false;

        state.user = null;

        state.accessToken = null;

        state.refreshToken = null;

        state.isAuthenticated = false;

        state.authInitialized = true;

        state.error = action.payload ?? {
          message: "Unable to restore user profile.",
        };

        clearSession();
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.authInitialized = true;
        state.error = null;
        saveUser(action.payload);
      })

      // Update profile
      .addCase(updateProfile.pending, setPending)
      .addCase(updateProfile.rejected, setRejected)
      .addCase(updateProfile.fulfilled, (state, action) => {
        const updatedUser = action.payload?.user ?? action.payload;

        state.loading = false;
        state.success = true;

        state.user = updatedUser;

        saveUser(updatedUser);
      })

      // Forgot password
      .addCase(forgotPassword.pending, setPending)
      .addCase(forgotPassword.rejected, setRejected)
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.success === false) {
          state.success = false;

          state.forgotSuccess = false;

          state.error = action.payload;

          return;
        }

        state.success = true;
        state.forgotSuccess = true;
      })

      // Reset password
      .addCase(resetPassword.pending, setPending)
      .addCase(resetPassword.rejected, setRejected)
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.resetSuccess = true;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, setLoggedOut)
      .addCase(logoutUser.rejected, setLoggedOut)

      // Logout all
      .addCase(logoutAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutAll.fulfilled, setLoggedOut)
      .addCase(logoutAll.rejected, setLoggedOut);
  },
});

export const { clearLocalSession, clearError, clearSuccess, setAccessToken } =
  authSlice.actions;

export default authSlice.reducer;
