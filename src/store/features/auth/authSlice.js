import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/store/constant/api";
import getApiErrorPayload from "@/store/constant/getApiErrorPayload";

// ── Local storage helpers ─────────────────────────────────────────────────────
const fromStorage = (key) => {
  try {
    return localStorage.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");

    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const saveSession = (access, user) => {
  try {
    localStorage.setItem("accessToken", access);

    localStorage.setItem("user", JSON.stringify(user));

    // Remove old insecure refresh-token storage.
    localStorage.removeItem("refreshToken");
  } catch {
    // Ignore browser storage errors.
  }
};

const saveUser = (user) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    // Ignore browser storage errors.
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  } catch {
    // Ignore browser storage errors.
  }
};

// Remove any refresh token saved by the previous implementation.
try {
  localStorage.removeItem("refreshToken");
} catch {
  // Ignore browser storage errors.
}

// ── Authentication thunks ─────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/register/", userData);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
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
      return rejectWithValue(getApiErrorPayload(error));
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
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

// Private authenticated profile only.
export const getMyProfile = createAsyncThunk(
  "auth/getMyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/me/");

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ slug, updateData }, { rejectWithValue }) => {
    try {
      const isFormData = updateData instanceof FormData;

      const { data } = await api.patch(`/users/${slug}/settings/`, updateData, {
        headers: isFormData
          ? {
              "Content-Type": "multipart/form-data",
            }
          : {},
      });

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (emailData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/forgot-password/", emailData);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/reset-password/", passwordData);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

// Refresh token automatically comes from the HttpOnly cookie.
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/users/logout/", {});
  } catch {
    // Clear frontend session regardless.
  }
});

// Requires the current access token.
// If expired, api.js refreshes it automatically first.
export const logoutAll = createAsyncThunk("auth/logoutAll", async () => {
  try {
    await api.post("/users/logout/all/", {});
  } catch {
    // Clear frontend session regardless.
  }
});

// ── Initial state ─────────────────────────────────────────────────────────────

const initialAccessToken = fromStorage("accessToken");

const initialState = {
  user: getStoredUser(),

  accessToken: initialAccessToken,

  // Kept only for compatibility with existing components.
  // The real refresh token is now an HttpOnly cookie.
  refreshToken: null,

  isAuthenticated: Boolean(initialAccessToken),

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

  state.error = action.payload ?? {
    message: "An unexpected error occurred.",
  };
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
    clearLocalSession: setLoggedOut,

    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = false;
      state.forgotSuccess = false;
      state.resetSuccess = false;
    },

    setAccessToken: (state, action) => {
      const accessToken = action.payload;

      state.accessToken = accessToken;
      state.isAuthenticated = Boolean(accessToken);

      try {
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        } else {
          localStorage.removeItem("accessToken");
        }
      } catch {
        // Ignore browser storage errors.
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
      .addCase(verifyOtp.fulfilled, (state, action) => {
        const { access, user } = action.payload;

        state.loading = false;
        state.success = true;

        state.user = user;
        state.accessToken = access;

        state.refreshToken = null;

        state.isAuthenticated = true;

        saveSession(access, user);
      })

      // ── Login
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

        // Refresh token is not returned in JSON.
        state.refreshToken = null;

        state.isAuthenticated = true;

        saveSession(access, user);
      })

      // ── Get own profile
      .addCase(getMyProfile.pending, setPending)
      .addCase(getMyProfile.rejected, setRejected)
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;

        saveUser(action.payload);
      })

      // ── Update profile
      .addCase(updateProfile.pending, setPending)
      .addCase(updateProfile.rejected, setRejected)
      .addCase(updateProfile.fulfilled, (state, action) => {
        const updatedUser = action.payload.user ?? action.payload;

        state.loading = false;
        state.success = true;
        state.user = updatedUser;

        saveUser(updatedUser);
      })

      // ── Forgot password
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

      // ── Reset password
      .addCase(resetPassword.pending, setPending)
      .addCase(resetPassword.rejected, setRejected)
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.resetSuccess = true;
      })

      // ── Logout current device
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, setLoggedOut)
      .addCase(logoutUser.rejected, setLoggedOut)

      // ── Logout all devices
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
