import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/store/constant/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const initialAsyncState = {
  loading: false,
  success: false,
  message: "",
  errors: {},
  errorMessage: "",
};

const extractFirstErrorMessage = (errors = {}) => {
  if (!errors || typeof errors !== "object") return "";

  for (const value of Object.values(errors)) {
    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    }
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
};

const normalizeApiError = (error) => {
  const fallback = {
    status: null,
    message: "Something went wrong. Please try again.",
    errors: {},
    redirectInfo: null,
  };

  if (!error?.response) {
    return {
      ...fallback,
      message: "Network error. Please check your internet connection.",
    };
  }

  const { status, data } = error.response;

  // Handle string response
  if (typeof data === "string") {
    return {
      status,
      message: data,
      errors: {},
      redirectInfo: null,
    };
  }

  // Handle redirect-style API response
  if (status === 301 && data?.new_slug) {
    return {
      status,
      message: data?.detail || "This brand URL has changed.",
      errors: {},
      redirectInfo: {
        oldSlug: data?.old_slug || null,
        newSlug: data?.new_slug || null,
        redirectUrl: data?.redirect_url || null,
      },
    };
  }

  const errors = {};
  let message = data?.detail || data?.message || fallback.message;

  if (data && typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      if (key === "detail" || key === "message") return;

      if (Array.isArray(value)) {
        errors[key] = value.map(String);
      } else if (typeof value === "string") {
        errors[key] = [value];
      } else if (value && typeof value === "object") {
        errors[key] = [JSON.stringify(value)];
      }
    });
  }

  const firstFieldError = extractFirstErrorMessage(errors);
  if (!message || message === fallback.message) {
    message = firstFieldError || fallback.message;
  }

  return {
    status,
    message,
    errors,
    redirectInfo: null,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────────

export const fetchBrands = createAsyncThunk(
  "eventPlanner/fetchBrands",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/event-planner/brands/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeApiError(error));
    }
  },
);

export const fetchMyBrand = createAsyncThunk(
  "eventPlanner/fetchMyBrand",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/event-planner/my-brand/");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeApiError(error));
    }
  },
);

export const fetchBrandBySlug = createAsyncThunk(
  "eventPlanner/fetchBrandBySlug",
  async (slug, thunkAPI) => {
    try {
      const response = await api.get(`/event-planner/brands/${slug}/`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeApiError(error));
    }
  },
);

export const createBrand = createAsyncThunk(
  "eventPlanner/createBrand",
  async (payload, thunkAPI) => {
    try {
      const response = await api.post("/event-planner/brands/create/", payload);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeApiError(error));
    }
  },
);

export const updateBrand = createAsyncThunk(
  "eventPlanner/updateBrand",
  async ({ slug, payload }, thunkAPI) => {
    try {
      const response = await api.patch(
        `/event-planner/brands/${slug}/update/`,
        payload,
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeApiError(error));
    }
  },
);

export const deleteBrand = createAsyncThunk(
  "eventPlanner/deleteBrand",
  async (slug, thunkAPI) => {
    try {
      const response = await api.delete(
        `/event-planner/brands/${slug}/delete/`,
      );

      return {
        slug,
        message: response.data?.message || "Brand deleted successfully.",
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(normalizeApiError(error));
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  brands: [],

  // Public brand page / brand details by slug
  publicBrandDetails: null,

  // Logged-in seller's own brand
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

  myBrand: {
    loading: false,
    errorMessage: "",
  },

  create: { ...initialAsyncState },
  update: { ...initialAsyncState },
  delete: { ...initialAsyncState },

  lastDeletedSlug: null,
};

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
      state.myBrandDetails = null;
      state.myBrand.errorMessage = "";
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
      // ── Fetch Brands ────────────────────────────────────────────────────────
      .addCase(fetchBrands.pending, (state) => {
        state.list.loading = true;
        state.list.errorMessage = "";
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.list.loading = false;
        state.brands = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.list.loading = false;
        state.list.errorMessage =
          action.payload?.message || "Failed to fetch brands.";
      })

      //fetch all brands
      .addCase(fetchMyBrand.pending, (state) => {
        state.myBrand.loading = true;
        state.myBrand.errorMessage = "";
      })
      .addCase(fetchMyBrand.fulfilled, (state, action) => {
        state.myBrand.loading = false;
        state.myBrandDetails = action.payload;
      })
      .addCase(fetchMyBrand.rejected, (state, action) => {
        state.myBrand.loading = false;
        state.myBrand.errorMessage =
          action.payload?.message || "Failed to fetch my brand.";
      })

      // ── Fetch Brand Details ────────────────────────────────────────────────
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

      // ── Create Brand ────────────────────────────────────────────────────────
      .addCase(createBrand.pending, (state) => {
        state.create.loading = true;
        state.create.success = false;
        state.create.message = "";
        state.create.errors = {};
        state.create.errorMessage = "";
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.create.loading = false;
        state.create.success = true;
        state.create.message = "Brand created successfully.";
        state.myBrandDetails = action.payload;
        state.publicBrandDetails = action.payload;

        const exists = state.brands.some(
          (item) => item.slug === action.payload.slug,
        );
        if (!exists) {
          state.brands.unshift(action.payload);
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

      // ── Update Brand ────────────────────────────────────────────────────────
      .addCase(updateBrand.pending, (state) => {
        state.update.loading = true;
        state.update.success = false;
        state.update.message = "";
        state.update.errors = {};
        state.update.errorMessage = "";
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.update.loading = false;
        state.update.success = true;
        state.update.message = "Brand updated successfully.";
        state.myBrandDetails = action.payload;
        state.publicBrandDetails = action.payload;

        state.brands = state.brands.map((brand) =>
          brand.slug === action.payload.slug || brand.id === action.payload.id
            ? { ...brand, ...action.payload }
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

      // ── Delete Brand ────────────────────────────────────────────────────────
      .addCase(deleteBrand.pending, (state) => {
        state.delete.loading = true;
        state.delete.success = false;
        state.delete.message = "";
        state.delete.errors = {};
        state.delete.errorMessage = "";
        state.lastDeletedSlug = null;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        const deletedSlug = action.payload.slug;

        state.delete.loading = false;
        state.delete.success = true;
        state.delete.message =
          action.payload.message || "Brand deleted successfully.";
        state.lastDeletedSlug = deletedSlug;

        state.brands = state.brands.filter(
          (brand) => brand.slug !== deletedSlug,
        );

        if (state.myBrandDetails?.slug === deletedSlug) {
          state.myBrandDetails = null;
        }

        if (state.publicBrandDetails?.slug === deletedSlug) {
          state.publicBrandDetails = null;
        }
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.delete.loading = false;
        state.delete.success = false;
        state.delete.errors = action.payload?.errors || {};
        state.delete.errorMessage =
          action.payload?.message || "Failed to delete brand.";
      });
  },
});

export const {
  clearPublicBrandDetails,
  clearMyBrandDetails,
  clearCreateBrandState,
  clearUpdateBrandState,
  clearDeleteBrandState,
  clearAllBrandErrors,
} = eventPlannerSlice.actions;

export default eventPlannerSlice.reducer;
