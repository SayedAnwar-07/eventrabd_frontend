import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import getApiErrorMessage from "@/store/constant/getApiErrorMessage";
import getApiErrorPayload from "@/store/constant/getApiErrorPayload";

// ============================================================
// HELPERS
// ============================================================

const initialAsyncState = {
  loading: false,
  success: false,
  message: "",
  errors: {},
  errorMessage: "",
};

const normalizeUserId = (id) => {
  if (id === null || id === undefined) return null;
  return String(id);
};

const getCurrentUserId = (state) =>
  normalizeUserId(state.auth?.user?.id ?? state.auth?.user?.pk);

const createMyBrandState = (userId = null) => ({
  loading: false,
  hasFetched: false,
  userId: normalizeUserId(userId),
  errorMessage: "",
});

const resetMyBrandCache = (state, userId = null) => {
  state.myBrandDetails = null;
  state.myBrand = createMyBrandState(userId);
};

const getRequestError = (error) => ({
  message: getApiErrorMessage(error),
  ...getApiErrorPayload(error),
});

// ============================================================
// PUBLIC BRANDS
// ============================================================

export const fetchBrands = createAsyncThunk(
  "eventPlanner/fetchBrands",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/event-planner/brands/");
      return response.data;
    } catch (error) {
      return rejectWithValue(getRequestError(error));
    }
  },
);

// ============================================================
// FETCH CURRENT SELLER BRAND
// ============================================================

export const fetchMyBrand = createAsyncThunk(
  "eventPlanner/fetchMyBrand",

  async (options = {}, { getState, rejectWithValue }) => {
    const userId = getCurrentUserId(getState());

    if (!userId) {
      return rejectWithValue({
        userId: null,
        message: "Authenticated user not found.",
      });
    }

    try {
      const response = await api.get("/event-planner/my-brand/");

      return {
        userId,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue({
        ...getRequestError(error),
        userId,
      });
    }
  },

  {
    condition: (options = {}, { getState }) => {
      const state = getState();
      const userId = getCurrentUserId(state);

      if (!userId) return false;

      const cache = state.eventPlanner?.myBrand;

      if (!cache) return true;

      // Different account: allow a new request.
      if (cache.userId !== userId) return true;

      // Same account: prevent concurrent requests.
      if (cache.loading) return false;

      // Allow an explicit retry after failure.
      if (options?.force === true) return true;

      // Already checked successfully or unsuccessfully.
      return !cache.hasFetched;
    },
  },
);

// ============================================================
// PUBLIC BRAND DETAILS
// ============================================================

export const fetchBrandBySlug = createAsyncThunk(
  "eventPlanner/fetchBrandBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/event-planner/brands/${slug}/`);

      return response.data;
    } catch (error) {
      return rejectWithValue(getRequestError(error));
    }
  },
);

// ============================================================
// CREATE BRAND
// ============================================================

export const createBrand = createAsyncThunk(
  "eventPlanner/createBrand",
  async (payload, { getState, rejectWithValue }) => {
    const userId = getCurrentUserId(getState());

    try {
      const response = await api.post("/event-planner/brands/create/", payload);

      return {
        userId,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue({
        ...getRequestError(error),
        userId,
      });
    }
  },
);

// ============================================================
// UPDATE BRAND
// ============================================================

export const updateBrand = createAsyncThunk(
  "eventPlanner/updateBrand",
  async ({ slug, payload }, { getState, rejectWithValue }) => {
    const userId = getCurrentUserId(getState());

    try {
      const response = await api.patch(
        `/event-planner/brands/${slug}/update/`,
        payload,
      );

      return {
        userId,
        data: response.data,
      };
    } catch (error) {
      return rejectWithValue({
        ...getRequestError(error),
        userId,
      });
    }
  },
);

// ============================================================
// DELETE BRAND
// ============================================================

export const deleteBrand = createAsyncThunk(
  "eventPlanner/deleteBrand",
  async (slug, { getState, rejectWithValue }) => {
    const userId = getCurrentUserId(getState());

    try {
      const response = await api.delete(
        `/event-planner/brands/${slug}/delete/`,
      );

      return {
        slug,
        userId,
        message: response.data?.message || "Brand deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue({
        ...getRequestError(error),
        userId,
      });
    }
  },
);

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  brands: [],

  publicBrandDetails: null,

  myBrandDetails: null,

  list: {
    loading: false,
    errorMessage: "",
  },

  publicDetails: {
    loading: false,
    errorMessage: "",
    redirectInfo: null,
  },

  myBrand: createMyBrandState(),

  create: { ...initialAsyncState },
  update: { ...initialAsyncState },
  delete: { ...initialAsyncState },

  lastDeletedSlug: null,
};

// ============================================================
// SLICE
// ============================================================

const eventPlannerSlice = createSlice({
  name: "eventPlanner",
  initialState,

  reducers: {
    clearPublicBrandDetails(state) {
      state.publicBrandDetails = null;
      state.publicDetails.errorMessage = "";
      state.publicDetails.redirectInfo = null;
    },

    clearMyBrandDetails(state) {
      resetMyBrandCache(state);
    },

    clearCreateBrandState(state) {
      state.create = { ...initialAsyncState };
    },

    clearUpdateBrandState(state) {
      state.update = { ...initialAsyncState };
    },

    clearDeleteBrandState(state) {
      state.delete = { ...initialAsyncState };
      state.lastDeletedSlug = null;
    },

    clearAllBrandErrors(state) {
      state.list.errorMessage = "";

      state.publicDetails.errorMessage = "";
      state.publicDetails.redirectInfo = null;

      state.myBrand.errorMessage = "";

      state.create.errorMessage = "";
      state.create.errors = {};

      state.update.errorMessage = "";
      state.update.errors = {};

      state.delete.errorMessage = "";
      state.delete.errors = {};
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================================
      // FETCH PUBLIC BRANDS
      // ======================================================

      .addCase(fetchBrands.pending, (state) => {
        state.list.loading = true;
        state.list.errorMessage = "";
      })

      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.list.loading = false;

        state.brands = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.results)
            ? action.payload.results
            : [];
      })

      .addCase(fetchBrands.rejected, (state, action) => {
        state.list.loading = false;

        state.list.errorMessage =
          action.payload?.message || "Failed to fetch brands.";
      })

      // ======================================================
      // FETCH MY BRAND
      // ======================================================

      .addCase(fetchMyBrand.pending, (state) => {
        state.myBrand.loading = true;
        state.myBrand.errorMessage = "";
      })

      .addCase(fetchMyBrand.fulfilled, (state, action) => {
        const responseUserId = action.payload?.userId;

        // Never accept another user's response.
        if (!responseUserId || responseUserId !== state.myBrand.userId) {
          return;
        }

        state.myBrand.loading = false;
        state.myBrand.hasFetched = true;
        state.myBrand.errorMessage = "";

        state.myBrandDetails = action.payload.data ?? null;
      })

      .addCase(fetchMyBrand.rejected, (state, action) => {
        const responseUserId = action.payload?.userId;

        if (!responseUserId || responseUserId !== state.myBrand.userId) {
          return;
        }

        state.myBrand.loading = false;

        // Mark the attempt as completed to prevent
        // an automatic infinite retry loop.
        state.myBrand.hasFetched = true;

        state.myBrand.errorMessage =
          action.payload?.message || "Failed to fetch your brand.";
      })

      // ======================================================
      // PUBLIC BRAND DETAILS
      // ======================================================

      .addCase(fetchBrandBySlug.pending, (state) => {
        state.publicDetails.loading = true;
        state.publicDetails.errorMessage = "";
        state.publicDetails.redirectInfo = null;
      })

      .addCase(fetchBrandBySlug.fulfilled, (state, action) => {
        state.publicDetails.loading = false;
        state.publicBrandDetails = action.payload;
      })

      .addCase(fetchBrandBySlug.rejected, (state, action) => {
        state.publicDetails.loading = false;

        state.publicDetails.errorMessage =
          action.payload?.message || "Failed to fetch brand details.";

        state.publicDetails.redirectInfo = action.payload?.redirectInfo || null;
      })

      // ======================================================
      // CREATE BRAND
      // ======================================================

      .addCase(createBrand.pending, (state) => {
        state.create.loading = true;
        state.create.success = false;
        state.create.message = "";
        state.create.errors = {};
        state.create.errorMessage = "";
      })

      .addCase(createBrand.fulfilled, (state, action) => {
        const { userId, data } = action.payload;

        state.create.loading = false;
        state.create.success = true;
        state.create.message = "Brand created successfully.";

        // Only synchronize the matching seller's cache.
        if (userId && userId === state.myBrand.userId) {
          state.myBrandDetails = data;
          state.myBrand.loading = false;
          state.myBrand.hasFetched = true;
          state.myBrand.errorMessage = "";
        }

        state.publicBrandDetails = data;

        const exists = state.brands.some((item) => item.slug === data?.slug);

        if (data && !exists) {
          state.brands.unshift(data);
        }
      })

      .addCase(createBrand.rejected, (state, action) => {
        state.create.loading = false;
        state.create.success = false;
        state.create.message = "";

        state.create.errors = action.payload?.errors || {};

        state.create.errorMessage =
          action.payload?.message || "Failed to create brand.";
      })

      // ======================================================
      // UPDATE BRAND
      // ======================================================

      .addCase(updateBrand.pending, (state) => {
        state.update.loading = true;
        state.update.success = false;
        state.update.message = "";
        state.update.errors = {};
        state.update.errorMessage = "";
      })

      .addCase(updateBrand.fulfilled, (state, action) => {
        const { userId, data } = action.payload;

        state.update.loading = false;
        state.update.success = true;
        state.update.message = "Brand updated successfully.";

        if (userId && userId === state.myBrand.userId) {
          state.myBrandDetails = data;
          state.myBrand.loading = false;
          state.myBrand.hasFetched = true;
          state.myBrand.errorMessage = "";
        }

        state.publicBrandDetails = data;

        state.brands = state.brands.map((brand) =>
          brand.slug === data?.slug || brand.id === data?.id
            ? { ...brand, ...data }
            : brand,
        );
      })

      .addCase(updateBrand.rejected, (state, action) => {
        state.update.loading = false;
        state.update.success = false;

        state.update.errors = action.payload?.errors || {};

        state.update.errorMessage =
          action.payload?.message || "Failed to update brand.";

        if (action.payload?.redirectInfo) {
          state.update.message = action.payload.message;
        }
      })

      // ======================================================
      // DELETE BRAND
      // ======================================================

      .addCase(deleteBrand.pending, (state) => {
        state.delete.loading = true;
        state.delete.success = false;
        state.delete.message = "";
        state.delete.errors = {};
        state.delete.errorMessage = "";
        state.lastDeletedSlug = null;
      })

      .addCase(deleteBrand.fulfilled, (state, action) => {
        const { slug, userId, message } = action.payload;

        state.delete.loading = false;
        state.delete.success = true;
        state.delete.message = message;
        state.lastDeletedSlug = slug;

        state.brands = state.brands.filter((brand) => brand.slug !== slug);

        // Only clear the current seller's own brand.
        if (
          userId &&
          userId === state.myBrand.userId &&
          state.myBrandDetails?.slug === slug
        ) {
          state.myBrandDetails = null;
          state.myBrand.loading = false;
          state.myBrand.hasFetched = true;
          state.myBrand.errorMessage = "";
        }

        if (state.publicBrandDetails?.slug === slug) {
          state.publicBrandDetails = null;
        }
      })

      .addCase(deleteBrand.rejected, (state, action) => {
        state.delete.loading = false;
        state.delete.success = false;

        state.delete.errors = action.payload?.errors || {};

        state.delete.errorMessage =
          action.payload?.message || "Failed to delete brand.";
      })

      // ======================================================
      // AUTHENTICATION EVENTS
      // ======================================================

      // Login
      .addCase("auth/login/fulfilled", (state, action) => {
        const userId = normalizeUserId(
          action.payload?.user?.id ?? action.payload?.user?.pk,
        );

        resetMyBrandCache(state, userId);
      })

      // OTP verification
      .addCase("auth/verifyOtp/fulfilled", (state, action) => {
        const userId = normalizeUserId(
          action.payload?.user?.id ?? action.payload?.user?.pk,
        );

        resetMyBrandCache(state, userId);
      })

      // Restored session: use verified profile identity.
      .addCase("auth/getMyProfile/fulfilled", (state, action) => {
        const userId = normalizeUserId(
          action.payload?.id ?? action.payload?.pk,
        );

        if (state.myBrand.userId !== userId) {
          resetMyBrandCache(state, userId);
        }
      })

      // Do not retain brand data after logout.
      .addCase("auth/logout/pending", (state) => {
        resetMyBrandCache(state);
      })

      .addCase("auth/logout/fulfilled", (state) => {
        resetMyBrandCache(state);
      })

      .addCase("auth/logout/rejected", (state) => {
        resetMyBrandCache(state);
      })

      .addCase("auth/logoutAll/pending", (state) => {
        resetMyBrandCache(state);
      })

      .addCase("auth/logoutAll/fulfilled", (state) => {
        resetMyBrandCache(state);
      })

      .addCase("auth/logoutAll/rejected", (state) => {
        resetMyBrandCache(state);
      })

      // Expired/invalid restored session.
      .addCase("auth/restoreSession/rejected", (state) => {
        resetMyBrandCache(state);
      })

      // Invalid profile authentication.
      .addCase("auth/getMyProfile/rejected", (state, action) => {
        if (action.payload?.status === 401) {
          resetMyBrandCache(state);
        }
      });
  },
});

// ============================================================
// EXPORTS
// ============================================================

export const {
  clearPublicBrandDetails,
  clearMyBrandDetails,
  clearCreateBrandState,
  clearUpdateBrandState,
  clearDeleteBrandState,
  clearAllBrandErrors,
} = eventPlannerSlice.actions;

export default eventPlannerSlice.reducer;
