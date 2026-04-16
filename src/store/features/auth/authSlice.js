import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/store/constant/api";

// ── Error handler ─────────────────────────────────────────────────────────────
const getErrorPayload = (error) => {
  const data = error.response?.data;
  if (!data) return { detail: "Something went wrong. Please try again." };
  return data;
};

// ── Local storage helpers ─────────────────────────────────────────────────────
const fromStorage = (key) => {
  try {
    return localStorage.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const saveSession = (access, refresh, user) => {
  try {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    /* ignore quota / private mode errors */
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  } catch {
    /* ignore */
  }
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/register/", userData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (otpData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/verify-otp/", otpData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/login/", loginData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${slug}/`);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ slug, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/users/${slug}/settings/`, updateData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

// Works for both logged-in and public users (backend has AllowAny)
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/forgot-password/", emailData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

// Works for both logged-in and public users (backend has AllowAny)
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/reset-password/", passwordData);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error));
    }
  },
);

// Blacklists the current refresh token on the server (single device logout)
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    const refresh = getState().auth.refreshToken;
    if (refresh) {
      try {
        await api.post("/users/logout/", { refresh });
      } catch {
        /* clear locally regardless of server response */
      }
    }
  },
);

// Bumps token_version on the server, invalidating all active sessions
export const logoutAll = createAsyncThunk(
  "auth/logoutAll",
  async (_, { getState }) => {
    const refresh = getState().auth.refreshToken;
    try {
      await api.post("/users/logout/all/", { refresh });
    } catch {
      /* clear locally regardless of server response */
    }
  },
);

// ── Initial state ─────────────────────────────────────────────────────────────
const rawUser = fromStorage("user");

const initialState = {
  user: rawUser ? JSON.parse(rawUser) : null,
  accessToken: fromStorage("accessToken"),
  refreshToken: fromStorage("refreshToken"),
  isAuthenticated: !!fromStorage("accessToken"),
  loading: false,
  error: null,
  success: false,
  forgotSuccess: false,
  resetSuccess: false,
};

// ── Shared reducer helpers ────────────────────────────────────────────────────
const setPending = (state) => {
  state.loading = true;
  state.error = null;
  state.success = false;
};

const setRejected = (state, action) => {
  state.loading = false;
  state.error = action.payload ?? { detail: "An unexpected error occurred." };
};

const setLoggedOut = (state) => {
  state.user = null;
  state.accessToken = null;
  state.refreshToken = null;
  state.isAuthenticated = false;
  state.loading = false;
  state.error = null;
  state.success = false;
  state.forgotSuccess = false;
  state.resetSuccess = false;
  clearSession();
};

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Instant client-side session clear (no API call)
    clearLocalSession: setLoggedOut,

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = false;
      state.forgotSuccess = false;
      state.resetSuccess = false;
    },

    // Used by axios interceptor to sync a refreshed access token into Redux
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      try {
        localStorage.setItem("accessToken", action.payload);
      } catch {
        /* ignore */
      }
    },
  },

  extraReducers: (builder) => {
    builder

      // ── Register
      .addCase(registerUser.pending, setPending)
      .addCase(registerUser.rejected, setRejected)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      // ── Verify OTP
      .addCase(verifyOtp.pending, setPending)
      .addCase(verifyOtp.rejected, setRejected)
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      // ── Login
      .addCase(loginUser.pending, setPending)
      .addCase(loginUser.rejected, (state, action) => {
        setRejected(state, action);
        state.isAuthenticated = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { access, refresh, user } = action.payload;
        state.loading = false;
        state.success = true;
        state.user = user;
        state.accessToken = access;
        state.refreshToken = refresh;
        state.isAuthenticated = true;
        saveSession(access, refresh, user);
      })

      // ── Get profile
      .addCase(getProfile.pending, setPending)
      .addCase(getProfile.rejected, setRejected)
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })

      // ── Update profile
      .addCase(updateProfile.pending, setPending)
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        // Flatten DRF field-level errors into a single readable message
        if (payload && typeof payload === "object" && !payload.detail) {
          state.error = { detail: Object.values(payload).flat().join(" ") };
        } else {
          state.error = payload ?? { detail: "Failed to update profile." };
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedUser = action.payload.user ?? action.payload;
        state.user = updatedUser;
        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch {
          /* ignore */
        }
      })

      // ── Forgot password
      .addCase(forgotPassword.pending, setPending)
      .addCase(forgotPassword.rejected, setRejected)
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.forgotSuccess = true;
      })

      // ── Reset password
      .addCase(resetPassword.pending, setPending)
      .addCase(resetPassword.rejected, setRejected)
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.resetSuccess = true;
      })

      // ── Logout (single device)
      .addCase(logoutUser.pending, setPending)
      .addCase(logoutUser.fulfilled, setLoggedOut)
      .addCase(logoutUser.rejected, setLoggedOut)

      // ── Logout all devices
      .addCase(logoutAll.pending, setPending)
      .addCase(logoutAll.fulfilled, setLoggedOut)
      .addCase(logoutAll.rejected, setLoggedOut);
  },
});

export const { clearLocalSession, clearError, clearSuccess, setAccessToken } =
  authSlice.actions;

export default authSlice.reducer;
