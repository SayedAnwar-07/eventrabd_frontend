import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/store/constant/api";

// ── Helpers ───────────────────────────────────────────────────────────────

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (!data) return error.message || "Something went wrong";

  if (typeof data === "string") {
    const titleMatch = data.match(/<title>(.*?)<\/title>/i);
    if (titleMatch?.[1]) return titleMatch[1];

    return data.replace(/<[^>]*>/g, "").trim() || "Server error";
  }

  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.error) return data.error;

  if (data.non_field_errors) {
    return Array.isArray(data.non_field_errors)
      ? data.non_field_errors.join(" ")
      : data.non_field_errors;
  }

  if (typeof data === "object") {
    const firstError = Object.values(data)[0];

    if (Array.isArray(firstError)) return firstError.join(" ");
    if (typeof firstError === "string") return firstError;

    return "Validation error";
  }

  return "Server error";
};

const serviceUrl = ({ brandSlug, serviceId, serviceName }) =>
  `/event-services/brands/${brandSlug}/services/${serviceId}/${serviceName}/`;

const normalizeList = (payload) => ({
  data: Array.isArray(payload) ? payload : payload.results || [],
  count: Array.isArray(payload) ? payload.length : payload.count || 0,
  next: Array.isArray(payload) ? null : payload.next || null,
  previous: Array.isArray(payload) ? null : payload.previous || null,
});

const matchesService = (service, serviceId, serviceName) => {
  return (
    service?.id === serviceId ||
    service?.slug === serviceName ||
    service?.service_name === serviceName
  );
};

const upsertService = (list, service) => {
  const index = list.findIndex((item) => item.id === service.id);

  if (index !== -1) {
    list[index] = service;
  } else {
    list.unshift(service);
  }
};

// ── Async Thunks ──────────────────────────────────────────────────────────

export const fetchBrandServices = createAsyncThunk(
  "eventServices/fetchBrandServices",
  async (brandSlug, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/event-services/brands/${brandSlug}/services/`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchEventServiceDetail = createAsyncThunk(
  "eventServices/fetchEventServiceDetail",
  async ({ brandSlug, serviceId, serviceName }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        serviceUrl({ brandSlug, serviceId, serviceName }),
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

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

export const updateEventService = createAsyncThunk(
  "eventServices/updateEventService",
  async ({ brandSlug, serviceId, serviceName, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `${serviceUrl({ brandSlug, serviceId, serviceName })}update/`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteEventService = createAsyncThunk(
  "eventServices/deleteEventService",
  async ({ brandSlug, serviceId, serviceName }, { rejectWithValue }) => {
    try {
      await api.delete(
        `${serviceUrl({ brandSlug, serviceId, serviceName })}delete/`,
      );

      return { brandSlug, serviceId, serviceName };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteGalleryImage = createAsyncThunk(
  "eventServices/deleteGalleryImage",
  async (
    { brandSlug, serviceId, serviceName, imageId },
    { rejectWithValue },
  ) => {
    try {
      await api.delete(
        `${serviceUrl({
          brandSlug,
          serviceId,
          serviceName,
        })}gallery/${imageId}/delete/`,
      );

      return { brandSlug, serviceId, serviceName, imageId };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────

const initialState = {
  services: {
    data: [],
    count: 0,
    next: null,
    previous: null,
    loading: false,
    error: null,
  },

  brandServices: {
    data: [],
    count: 0,
    next: null,
    previous: null,
    loading: false,
    error: null,
  },

  currentService: {
    data: null,
    loading: false,
    error: null,
  },

  operation: {
    loading: false,
    error: null,
    success: null,
  },

  filters: {
    serviceType: null,
    search: null,
    brandSlug: null,
    currentPage: 1,
    pageSize: 12,
  },

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

    clearCurrentService(state) {
      state.currentService.data = null;
      state.currentService.error = null;
    },

    clearOperationState(state) {
      state.operation.loading = false;
      state.operation.error = null;
      state.operation.success = null;
    },

    resetFilters(state) {
      state.filters = initialState.filters;
      state.brandFilters = initialState.brandFilters;
    },

    updateGalleryImageSortOrder(state, action) {
      const { serviceId, serviceName, images } = action.payload;

      if (matchesService(state.currentService.data, serviceId, serviceName)) {
        state.currentService.data.gallery_images = images;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ── Fetch Brand Services ────────────────────────────────────────────
      .addCase(fetchBrandServices.pending, (state) => {
        state.brandServices.loading = true;
        state.brandServices.error = null;
      })
      .addCase(fetchBrandServices.fulfilled, (state, action) => {
        const payload = normalizeList(action.payload);

        state.brandServices.loading = false;
        state.brandServices.data = payload.data;
        state.brandServices.count = payload.count;
        state.brandServices.next = payload.next;
        state.brandServices.previous = payload.previous;
      })
      .addCase(fetchBrandServices.rejected, (state, action) => {
        state.brandServices.loading = false;
        state.brandServices.error = action.payload;
      })

      // ── Fetch Event Service Detail ──────────────────────────────────────
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
      })

      // ── Create Event Service ────────────────────────────────────────────
      .addCase(createEventService.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(createEventService.fulfilled, (state, action) => {
        const service = action.payload;

        const existsInServices = state.services.data.some(
          (item) => item.id === service.id,
        );

        const existsInBrandServices = state.brandServices.data.some(
          (item) => item.id === service.id,
        );

        upsertService(state.services.data, service);
        upsertService(state.brandServices.data, service);

        if (!existsInServices) state.services.count += 1;
        if (!existsInBrandServices) state.brandServices.count += 1;

        state.operation.loading = false;
        state.operation.success = "Service created successfully";
      })
      .addCase(createEventService.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })

      // ── Update Event Service ────────────────────────────────────────────
      .addCase(updateEventService.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(updateEventService.fulfilled, (state, action) => {
        const service = action.payload;

        upsertService(state.services.data, service);
        upsertService(state.brandServices.data, service);

        if (state.currentService.data?.id === service.id) {
          state.currentService.data = service;
        }

        state.operation.loading = false;
        state.operation.success = "Service updated successfully";
      })
      .addCase(updateEventService.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })

      // ── Delete Event Service ────────────────────────────────────────────
      .addCase(deleteEventService.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(deleteEventService.fulfilled, (state, action) => {
        const { serviceId, serviceName } = action.payload;

        const oldServicesCount = state.services.data.length;
        const oldBrandServicesCount = state.brandServices.data.length;

        state.services.data = state.services.data.filter(
          (service) => !matchesService(service, serviceId, serviceName),
        );

        state.brandServices.data = state.brandServices.data.filter(
          (service) => !matchesService(service, serviceId, serviceName),
        );

        if (state.services.data.length < oldServicesCount) {
          state.services.count = Math.max(0, state.services.count - 1);
        }

        if (state.brandServices.data.length < oldBrandServicesCount) {
          state.brandServices.count = Math.max(
            0,
            state.brandServices.count - 1,
          );
        }

        if (matchesService(state.currentService.data, serviceId, serviceName)) {
          state.currentService.data = null;
        }

        state.operation.loading = false;
        state.operation.success = "Service deleted successfully";
      })
      .addCase(deleteEventService.rejected, (state, action) => {
        state.operation.loading = false;
        state.operation.error = action.payload;
      })

      // ── Delete Gallery Image ────────────────────────────────────────────
      .addCase(deleteGalleryImage.pending, (state) => {
        state.operation.loading = true;
        state.operation.error = null;
        state.operation.success = null;
      })
      .addCase(deleteGalleryImage.fulfilled, (state, action) => {
        const { serviceId, serviceName, imageId } = action.payload;

        const removeImage = (service) => {
          if (!service?.gallery_images) return;

          service.gallery_images = service.gallery_images.filter(
            (image) => image.id !== imageId,
          );
        };

        if (matchesService(state.currentService.data, serviceId, serviceName)) {
          removeImage(state.currentService.data);
        }

        state.services.data.forEach((service) => {
          if (matchesService(service, serviceId, serviceName)) {
            removeImage(service);
          }
        });

        state.brandServices.data.forEach((service) => {
          if (matchesService(service, serviceId, serviceName)) {
            removeImage(service);
          }
        });

        state.operation.loading = false;
        state.operation.success = "Gallery image deleted successfully";
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
