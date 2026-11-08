import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api, {
  clearAuthStorage,
  saveAccessToken,
  getFreshAccessToken,
} from "@/store/constant/api";

import { connectWebSocket } from "@/websocket/websocketClient";

import getApiErrorMessage from "@/store/constant/getApiErrorMessage";

import { syncSellerProfile } from "@/store/features/eventService/eventServiceSlice";

// ============================================================
// HELPERS
// ============================================================

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const saveUser = (user) => {
  try {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }

    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.warn("Unable to save user session:", error);
  }
};

const clearSession = () => {
  clearAuthStorage();

  try {
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.warn("Unable to clear stored user:", error);
  }
};

const getUserId = (user) => user?.id ?? user?.pk ?? null;

const buildSellerSyncPayload = (profile, fallbackUser = null) => {
  const user = profile?.user ?? profile;
  if (!user || typeof user !== "object") {
    return null;
  }
  const id = getUserId(user) ?? getUserId(fallbackUser);

  if (id == null) return null;

  const payload = { id };

  if (Object.prototype.hasOwnProperty.call(user, "full_name")) {
    payload.full_name = user.full_name;
  }

  if (Object.prototype.hasOwnProperty.call(user, "profile_image_url")) {
    payload.profile_image_url = user.profile_image_url;
  } else if (Object.prototype.hasOwnProperty.call(user, "profile_image")) {
    const image = user.profile_image;

    payload.profile_image_url =
      typeof image === "string" ? image : (image?.url ?? null);
  }

  if (Object.prototype.hasOwnProperty.call(user, "contact_number")) {
    payload.contact_number = user.contact_number;
  }

  return Object.keys(payload).length > 1 ? payload : null;
};

// ============================================================
// REGISTER
// ============================================================

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

// ============================================================
// VERIFY OTP
// ============================================================

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (otpData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/verify-otp/", otpData);

      const access = data?.access;

      if (!access) {
        throw new Error("Access token missing from verify response.");
      }

      if (!data?.user) {
        throw new Error("User information missing from verify response.");
      }

      saveAccessToken(access);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// ============================================================
// LOGIN
// ============================================================

export const loginUser = createAsyncThunk(
  "auth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/login/", loginData);

      const access = data?.access;

      if (!access) {
        throw new Error("Access token missing from login response.");
      }

      if (!data?.user) {
        throw new Error("User information missing from login response.");
      }

      saveAccessToken(access);

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// ============================================================
// RESTORE SESSION
// ============================================================

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      // Uses the shared refresh request.
      const access = await getFreshAccessToken();

      if (!access) {
        throw new Error("Unable to restore access token.");
      }

      return { access };
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401) {
        clearSession();
      }

      return rejectWithValue({
        message: getApiErrorMessage(error),
        status,
      });
    }
  },
);

// ============================================================
// GET CURRENT USER PROFILE
// ============================================================

export const getMyProfile = createAsyncThunk(
  "auth/getMyProfile",

  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const { data } = await api.get("/users/me/");

      if (!getUserId(data)) {
        throw new Error("User ID missing from profile response.");
      }

      const syncPayload = buildSellerSyncPayload(data, getState().auth.user);

      if (syncPayload) {
        dispatch(syncSellerProfile(syncPayload));
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        message: getApiErrorMessage(error),
        status: error?.response?.status,
      });
    }
  },
);

// ============================================================
// UPDATE PROFILE
// ============================================================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",

  async ({ slug, updateData }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { data } = await api.patch(`/users/${slug}/settings/`, updateData);

      const syncPayload = buildSellerSyncPayload(data, getState().auth.user);

      if (syncPayload) {
        dispatch(syncSellerProfile(syncPayload));
      }

      return data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// ============================================================
// FORGOT PASSWORD
// ============================================================

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

// ============================================================
// RESET PASSWORD
// ============================================================

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

// ============================================================
// LOGOUT CURRENT DEVICE
// ============================================================

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/users/logout/", {});
  } finally {
    clearSession();
  }
});

// ============================================================
// LOGOUT ALL DEVICES
// ============================================================

export const logoutAll = createAsyncThunk("auth/logoutAll", async () => {
  try {
    await api.post("/users/logout/all/", {});
  } finally {
    clearSession();
  }
});

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  user: getStoredUser(),

  accessToken: null,

  refreshToken: null,

  isAuthenticated: false,

  // Token restoration and identity verification
  // are separate authentication stages.
  identityVerified: false,

  authInitialized: false,

  loading: false,
  error: null,
  success: false,

  forgotSuccess: false,
  resetSuccess: false,
};

// ============================================================
// SHARED REDUCERS
// ============================================================

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
  state.identityVerified = false;
  state.authInitialized = true;

  state.loading = false;
  state.error = null;
  state.success = false;

  state.forgotSuccess = false;
  state.resetSuccess = false;

  clearSession();
};

// ============================================================
// SLICE
// ============================================================

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
      const access = action.payload;

      saveAccessToken(access);

      state.accessToken = access ?? null;

      // A new token must be verified against /users/me/.
      state.identityVerified = false;
      state.authInitialized = false;

      state.isAuthenticated = Boolean(access);
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================================
      // REGISTER
      // ======================================================

      .addCase(registerUser.pending, setPending)

      .addCase(registerUser.rejected, setRejected)

      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      // ======================================================
      // VERIFY OTP
      // ======================================================

      .addCase(verifyOtp.pending, setPending)

      .addCase(verifyOtp.rejected, (state, action) => {
        setRejected(state, action);

        state.isAuthenticated = false;
        state.identityVerified = false;
        state.authInitialized = true;
      })

      .addCase(verifyOtp.fulfilled, (state, action) => {
        const { access, user } = action.payload;

        state.loading = false;
        state.success = true;

        state.user = user;
        state.accessToken = access;
        state.refreshToken = null;

        state.isAuthenticated = true;
        state.identityVerified = true;
        state.authInitialized = true;

        saveUser(user);

        connectWebSocket(access);
      })

      // ======================================================
      // LOGIN
      // ======================================================

      .addCase(loginUser.pending, setPending)

      .addCase(loginUser.rejected, (state, action) => {
        setRejected(state, action);

        state.isAuthenticated = false;
        state.identityVerified = false;
        state.authInitialized = true;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        const { access, user } = action.payload;

        state.loading = false;
        state.success = true;

        state.user = user;
        state.accessToken = access;
        state.refreshToken = null;

        state.isAuthenticated = true;
        state.identityVerified = true;
        state.authInitialized = true;

        saveUser(user);

        connectWebSocket(access);
      })

      // ======================================================
      // RESTORE SESSION
      // ======================================================

      .addCase(restoreSession.pending, (state) => {
        state.error = null;
        state.authInitialized = false;
        state.identityVerified = false;
      })

      .addCase(restoreSession.fulfilled, (state, action) => {
        const access = action.payload?.access;

        state.accessToken = access;

        state.isAuthenticated = true;

        // The user is not verified until getMyProfile succeeds.
        state.identityVerified = false;
        state.authInitialized = false;

        state.error = null;

        connectWebSocket(access);
      })

      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.authInitialized = true;
        state.identityVerified = false;

        state.error = action.payload?.message ?? null;

        state.isAuthenticated = false;

        if (action.payload?.status === 401) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;

          clearSession();
        }
      })

      // ======================================================
      // GET CURRENT PROFILE
      // ======================================================

      .addCase(getMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.identityVerified = false;
      })

      .addCase(getMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.authInitialized = true;
        state.identityVerified = false;

        state.error = action.payload?.message ?? {
          message: "Unable to verify user profile.",
        };

        state.isAuthenticated = false;

        if (action.payload?.status === 401) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;

          clearSession();
        }

        // Keep the stored profile for possible recovery,
        // but never treat it as a verified identity.
      })

      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;

        state.user = action.payload;

        state.isAuthenticated = true;
        state.identityVerified = true;
        state.authInitialized = true;

        state.error = null;

        saveUser(action.payload);
      })

      // ======================================================
      // UPDATE PROFILE
      // ======================================================

      .addCase(updateProfile.pending, setPending)

      .addCase(updateProfile.rejected, setRejected)

      .addCase(updateProfile.fulfilled, (state, action) => {
        const responseUser = action.payload?.user ?? action.payload;

        const updatedUser = {
          ...(state.user ?? {}),
          ...responseUser,
        };

        state.loading = false;
        state.success = true;

        state.user = updatedUser;

        saveUser(updatedUser);
      })

      // ======================================================
      // FORGOT PASSWORD
      // ======================================================

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

      // ======================================================
      // RESET PASSWORD
      // ======================================================

      .addCase(resetPassword.pending, setPending)

      .addCase(resetPassword.rejected, setRejected)

      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.resetSuccess = true;
      })

      // ======================================================
      // LOGOUT
      // ======================================================

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, setLoggedOut)

      .addCase(logoutUser.rejected, setLoggedOut)

      // ======================================================
      // LOGOUT ALL
      // ======================================================

      .addCase(logoutAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutAll.fulfilled, setLoggedOut)

      .addCase(logoutAll.rejected, setLoggedOut);
  },
});

// ============================================================
// EXPORTS
// ============================================================

export const { clearLocalSession, clearError, clearSuccess, setAccessToken } =
  authSlice.actions;

export default authSlice.reducer;
