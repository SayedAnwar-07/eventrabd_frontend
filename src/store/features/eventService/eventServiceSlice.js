import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/store/constant/api";

// ── Async Thunks ──────────────────────────────────────────────────────────

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data === "string") {
    const match = data.match(/<title>(.*?)<\/title>/i);
    return match ? match[1] : "Server error";
  }

  return data || error.message;
};

/**
 * Fetch all services for a specific brand
 * brand_slug: string (e.g., "brand-name")
 */
export const fetchBrandServices = createAsyncThunk(
  "eventServices/fetchBrandServices",
  async (brandSlug, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/event-services/brands/${brandSlug}/services/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

/**
 * Fetch a single service by slug
 */
export const fetchEventServiceDetail = createAsyncThunk(
  "eventServices/fetchEventServiceDetail",
  async ({ brandSlug, serviceName }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/event-services/brands/${brandSlug}/services/${serviceName}/`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

/**
 * Create a new event service
 * data: FormData with service details and optional images
 */
export const createEventService = createAsyncThunk(
  "eventServices/createEventService",
  async ({ brandSlug, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/event-services/brands/${brandSlug}/services/create/`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/**
 * Update an existing service
 * slug: string (service identifier)
 * data: FormData with updated service details
 */
export const updateEventService = createAsyncThunk(
  "eventServices/updateEventService",
  async ({ brandSlug, serviceName, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/event-services/brands/${brandSlug}/services/${serviceName}/update/`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

/**
 * Delete an event service
 */
export const deleteEventService = createAsyncThunk(
  "eventServices/deleteEventService",
  async ({ brandSlug, serviceName }, { rejectWithValue }) => {
    try {
      await api.delete(
        `/event-services/brands/${brandSlug}/services/${serviceName}/delete/`,
      );
      return { brandSlug, serviceName };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

/**
 * Delete a specific gallery image from a service
 */
export const deleteGalleryImage = createAsyncThunk(
  "eventServices/deleteGalleryImage",
  async ({ brandSlug, serviceName, imageId }, { rejectWithValue }) => {
    try {
      await api.delete(
        `/event-services/brands/${brandSlug}/services/${serviceName}/gallery/${imageId}/delete/`,
      );
      return { brandSlug, serviceName, imageId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────

const initialState = {
  // All services list with pagination
  services: {
    data: [],
    count: 0,
    next: null,
    previous: null,
    loading: false,
    error: null,
  },

  // Brand-specific services
  brandServices: {
    data: [],
    count: 0,
    next: null,
    previous: null,
    loading: false,
    error: null,
  },

  // Single service detail
  currentService: {
    data: null,
    loading: false,
    error: null,
  },

  // Service creation/update/deletion operations
  operation: {
    loading: false,
    error: null,
    success: null,
  },

  // Metadata for filtering
  filters: {
    serviceType: null,
    search: null,
    brandSlug: null,
    currentPage: 1,
    pageSize: 12,
  },

  // Metadata for brand services
  brandFilters: {
    serviceType: null,
    search: null,
    currentPage: 1,
    pageSize: 12,
  },
};

// ── Slice ────────────────────────────────────────────────────────────────

const eventServiceSlice = createSlice({
  name: "eventServices",
  initialState,

  reducers: {
    // Manual filter updates
    setServiceTypeFilter(state, action) {
      state.filters.serviceType = action.payload;
      state.filters.currentPage = 1;
    },

    setSearchFilter(state, action) {
      state.filters.search = action.payload;
      state.filters.currentPage = 1;
    },

    setBrandSlugFilter(state, action) {
      state.filters.brandSlug = action.payload;
      state.filters.currentPage = 1;
    },

    setCurrentPage(state, action) {
      state.filters.currentPage = action.payload;
    },

    setPageSize(state, action) {
      state.filters.pageSize = action.payload;
      state.filters.currentPage = 1;
    },

    // Brand services filters
    setBrandServiceTypeFilter(state, action) {
      state.brandFilters.serviceType = action.payload;
      state.brandFilters.currentPage = 1;
    },

    setBrandSearchFilter(state, action) {
      state.brandFilters.search = action.payload;
      state.brandFilters.currentPage = 1;
    },

    setBrandCurrentPage(state, action) {
      state.brandFilters.currentPage = action.payload;
    },

    // Clear current service
    clearCurrentService(state) {
      state.currentService.data = null;
      state.currentService.error = null;
    },

    // Clear operation state
    clearOperationState(state) {
      state.operation.loading = false;
      state.operation.error = null;
      state.operation.success = null;
    },

    // Reset all filters
    resetFilters(state) {
      state.filters = initialState.filters;
      state.brandFilters = initialState.brandFilters;
    },

    // Update gallery image sort order optimistically
    updateGalleryImageSortOrder(state, action) {
      const { serviceSlug, images } = action.payload;
      if (state.currentService.data?.slug === serviceSlug) {
        state.currentService.data.gallery_images = images;
      }
    },
  },

  extraReducers: (builder) => {
    // ── Fetch Brand Services ──────────────────────────────────────────────
    builder
      .addCase(fetchBrandServices.pending, (state) => {
        state.brandServices.loading = true;
        state.brandServices.error = null;
      })
      .addCase(fetchBrandServices.fulfilled, (state, action) => {
        state.brandServices.loading = false;
        state.brandServices.data = action.payload.results || [];
        state.brandServices.count = action.payload.count || 0;
        state.brandServices.next = action.payload.next || null;
        state.brandServices.previous = action.payload.previous || null;
      })
      .addCase(fetchBrandServices.rejected, (state, action) => {
        state.brandServices.loading = false;
        state.brandServices.error = action.payload;
      });

    // ── Fetch Event Service Detail ────────────────────────────────────────
    builder
      .addCase(fetchEventServiceDetail.pending, (state) => {
        state.currentService.loading = true;
        state.currentService.error = null;
      })
      .addCase(fetchEventServiceDetail.fulfilled, (state, action) => {
        state.currentService.loading = false;
        state.currentService.data = action.payload;
      })
      .addCase(fetchEventServiceDetail.rejected, (state, action) => {
        state.currentService.loading = false;
        state.currentService.error = action.payload;
      });

    // ── Create Event Service ──────────────────────────────────────────────
    builder
      .addCase(createEventService.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(createEventService.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = "Service created successfully";
        state.services.data.unshift(action.payload);
        state.services.count += 1;
      })
      .addCase(createEventService.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      });

    // ── Update Event Service ──────────────────────────────────────────────
    builder
      .addCase(updateEventService.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(updateEventService.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = "Service updated successfully";

        // Update in all services list
        const index = state.services.data.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (index !== -1) {
          state.services.data[index] = action.payload;
        }

        // Update in brand services list
        const brandIndex = state.brandServices.data.findIndex(
          (s) => s.id === action.payload.id,
        );
        if (brandIndex !== -1) {
          state.brandServices.data[brandIndex] = action.payload;
        }

        // Update current service if viewing
        if (state.currentService.data?.id === action.payload.id) {
          state.currentService.data = action.payload;
        }
      })
      .addCase(updateEventService.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      });

    // ── Delete Event Service ──────────────────────────────────────────────
    builder
      .addCase(deleteEventService.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(deleteEventService.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = "Service deleted successfully";

        const { serviceName } = action.payload;

        state.services.data = state.services.data.filter(
          (s) => s.slug !== serviceName,
        );

        state.brandServices.data = state.brandServices.data.filter(
          (s) => s.slug !== serviceName,
        );

        state.services.count = Math.max(0, state.services.count - 1);
        state.brandServices.count = Math.max(0, state.brandServices.count - 1);

        if (state.currentService.data?.slug === serviceName) {
          state.currentService.data = null;
        }
      })
      .addCase(deleteEventService.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      });

    // ── Delete Gallery Image ──────────────────────────────────────────────
    builder
      .addCase(deleteGalleryImage.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
      })
      .addCase(deleteGalleryImage.fulfilled, (state, action) => {
        state.operation.loading = false;
        state.operation.success = "Gallery image deleted successfully";

        const { serviceName, imageId } = action.payload;

        if (state.currentService.data?.slug === serviceName) {
          state.currentService.data.gallery_images =
            state.currentService.data.gallery_images.filter(
              (img) => img.id !== imageId,
            );
        }
      })
      .addCase(deleteGalleryImage.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      });
  },
});

export const {
  setServiceTypeFilter,
  setSearchFilter,
  setBrandSlugFilter,
  setCurrentPage,
  setPageSize,
  setBrandServiceTypeFilter,
  setBrandSearchFilter,
  setBrandCurrentPage,
  clearCurrentService,
  clearOperationState,
  resetFilters,
  updateGalleryImageSortOrder,
} = eventServiceSlice.actions;

export default eventServiceSlice.reducer;
