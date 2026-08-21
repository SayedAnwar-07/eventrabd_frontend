import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import { getApiErrorMessage } from "@/store/constant/getApiErrorMessage";

// =========================================================
// URL HELPERS
// =========================================================

const serviceUrl = ({ brandSlug, serviceId, serviceName }) =>
  `/event-services/brands/${brandSlug}/services/${serviceId}/${serviceName}/`;

// =========================================================
// NORMALIZERS
// =========================================================

const normalizeList = (payload) => ({
  data: Array.isArray(payload) ? payload : payload?.results || [],

  count: Array.isArray(payload) ? payload.length : payload?.count || 0,

  next: Array.isArray(payload) ? null : payload?.next || null,

  previous: Array.isArray(payload) ? null : payload?.previous || null,
});

// =========================================================
// SERVICE HELPERS
// =========================================================

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

// =========================================================
// PUBLIC MARKETPLACE SERVICES
// =========================================================

export const fetchPublicServices = createAsyncThunk(
  "eventServices/fetchPublicServices",

  async (
    {
      page = 1,
      pageSize = 12,

      serviceType = "",
      search = "",
      division = "",

      // NEW
      seller_id = "",
      brand_id = "",
    } = {},

    { rejectWithValue },
  ) => {
    try {
      const params = {
        page,
        page_size: pageSize,
      };

      const normalizedServiceType = serviceType?.trim();

      const normalizedSearch = search?.trim();

      const normalizedDivision = division?.trim().toLowerCase();

      if (normalizedServiceType) {
        params.service_type = normalizedServiceType;
      }

      if (normalizedSearch) {
        params.search = normalizedSearch;
      }

      if (normalizedDivision) {
        params.division = normalizedDivision;
      }

      // Seller filtering

      if (seller_id) {
        params.seller_id = seller_id;
      }

      // Brand filtering

      if (brand_id) {
        params.brand_id = brand_id;
      }

      const response = await api.get("/event-services/services/", {
        params,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// SELLER AUTOCOMPLETE SEARCH
// =========================================================

export const fetchSellerSuggestions = createAsyncThunk(
  "eventServices/fetchSellerSuggestions",

  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get("/event-services/seller-suggestions/", {
        params: {
          q: query,
        },
      });

      return response.data.results || [];
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// BRAND AUTOCOMPLETE SEARCH
// =========================================================

export const fetchBrandSuggestions = createAsyncThunk(
  "eventServices/fetchBrandSuggestions",

  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get("/event-services/brand-suggestions/", {
        params: {
          q: query,
        },
      });

      return response.data.results || [];
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// BRAND SERVICES
// =========================================================

export const fetchBrandServices = createAsyncThunk(
  "eventServices/fetchBrandServices",

  async (brandSlug, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/event-services/brands/${brandSlug}/services/`,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// SERVICE DETAIL
// =========================================================

export const fetchEventServiceDetail = createAsyncThunk(
  "eventServices/fetchEventServiceDetail",

  async (
    { brandSlug, serviceId, serviceName },

    { rejectWithValue },
  ) => {
    try {
      const response = await api.get(
        serviceUrl({
          brandSlug,
          serviceId,
          serviceName,
        }),
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// CREATE SERVICE
// =========================================================

export const createEventService = createAsyncThunk(
  "eventServices/createEventService",

  async (
    { brandSlug, data },

    { rejectWithValue },
  ) => {
    try {
      const response = await api.post(
        `/event-services/brands/${brandSlug}/services/create/`,

        data,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// UPDATE SERVICE
// =========================================================

export const updateEventService = createAsyncThunk(
  "eventServices/updateEventService",

  async (
    { brandSlug, serviceId, serviceName, data },

    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch(
        `${serviceUrl({
          brandSlug,
          serviceId,
          serviceName,
        })}update/`,

        data,

        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// DELETE SERVICE
// =========================================================

export const deleteEventService = createAsyncThunk(
  "eventServices/deleteEventService",

  async (
    { brandSlug, serviceId, serviceName },

    { rejectWithValue },
  ) => {
    try {
      await api.delete(
        `${serviceUrl({
          brandSlug,
          serviceId,
          serviceName,
        })}delete/`,
      );

      return {
        brandSlug,
        serviceId,
        serviceName,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// DELETE GALLERY IMAGE
// =========================================================

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

      return {
        brandSlug,
        serviceId,
        serviceName,
        imageId,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  // =====================================================
  // PUBLIC MARKETPLACE SERVICES
  // =====================================================

  services: {
    data: [],

    count: 0,

    next: null,

    previous: null,

    loading: false,

    error: null,
  },

  // =====================================================
  // BRAND SERVICES
  // =====================================================

  brandServices: {
    data: [],

    count: 0,

    next: null,

    previous: null,

    loading: false,

    error: null,
  },

  // =====================================================
  // AUTOCOMPLETE SEARCH
  // =====================================================

  sellerSuggestions: {
    data: [],

    loading: false,

    error: null,
  },

  brandSuggestions: {
    data: [],

    loading: false,

    error: null,
  },

  // Selected filters

  selectedSeller: null,

  selectedBrand: null,

  // =====================================================
  // SERVICE DETAIL
  // =====================================================

  currentService: {
    data: null,

    loading: false,

    error: null,
  },

  // =====================================================
  // CREATE UPDATE DELETE STATUS
  // =====================================================

  operation: {
    loading: false,

    error: null,

    success: null,
  },

  // =====================================================
  // MARKETPLACE FILTERS
  // =====================================================

  filters: {
    serviceType: null,

    search: null,

    sellerId: null,

    brandId: null,

    currentPage: 1,

    pageSize: 12,
  },

  // =====================================================
  // BRAND PAGE FILTERS
  // =====================================================

  brandFilters: {
    serviceType: null,

    search: null,

    currentPage: 1,

    pageSize: 12,
  },
};

// =========================================================
// SLICE
// =========================================================

const eventServiceSlice = createSlice({
  name: "eventServices",

  initialState,

  reducers: {
    // =====================================================
    // MARKETPLACE FILTERS
    // =====================================================

    setServiceTypeFilter(state, action) {
      state.filters.serviceType = action.payload;

      state.filters.currentPage = 1;
    },

    setSearchFilter(state, action) {
      state.filters.search = action.payload;

      state.filters.currentPage = 1;
    },

    setSellerFilter(state, action) {
      state.filters.sellerId = action.payload;

      state.filters.currentPage = 1;
    },

    setBrandFilter(state, action) {
      state.filters.brandId = action.payload;

      state.filters.currentPage = 1;
    },

    setCurrentPage(state, action) {
      state.filters.currentPage = action.payload;
    },

    setPageSize(state, action) {
      state.filters.pageSize = action.payload;

      state.filters.currentPage = 1;
    },

    // =====================================================
    // SEARCH SELECTION
    // =====================================================

    setSelectedSeller(state, action) {
      state.selectedSeller = action.payload;
    },

    setSelectedBrand(state, action) {
      state.selectedBrand = action.payload;
    },

    clearSellerSearch(state) {
      state.selectedSeller = null;

      state.sellerSuggestions.data = [];

      state.filters.sellerId = null;
    },

    clearBrandSearch(state) {
      state.selectedBrand = null;

      state.brandSuggestions.data = [];

      state.filters.brandId = null;
    },

    // =====================================================
    // BRAND SERVICES FILTER
    // =====================================================

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

    // =====================================================
    // CLEAN STATES
    // =====================================================

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

  // =====================================================
  // EXTRA REDUCERS
  // =====================================================

  extraReducers: (builder) => {
    // ===================================================
    // PUBLIC SERVICES
    // ===================================================

    builder

      .addCase(fetchPublicServices.pending, (state) => {
        state.services.loading = true;

        state.services.error = null;
      })

      .addCase(fetchPublicServices.fulfilled, (state, action) => {
        const payload = normalizeList(action.payload);

        state.services.loading = false;

        state.services.data = payload.data;

        state.services.count = payload.count;

        state.services.next = payload.next;

        state.services.previous = payload.previous;
      })

      .addCase(fetchPublicServices.rejected, (state, action) => {
        state.services.loading = false;

        state.services.error = action.payload;
      });

    // ===================================================
    // SELLER SUGGESTIONS
    // ===================================================

    builder

      .addCase(fetchSellerSuggestions.pending, (state) => {
        state.sellerSuggestions.loading = true;

        state.sellerSuggestions.error = null;
      })

      .addCase(fetchSellerSuggestions.fulfilled, (state, action) => {
        state.sellerSuggestions.loading = false;

        state.sellerSuggestions.data = action.payload;
      })

      .addCase(fetchSellerSuggestions.rejected, (state, action) => {
        state.sellerSuggestions.loading = false;

        state.sellerSuggestions.error = action.payload;
      });

    // ===================================================
    // BRAND SUGGESTIONS
    // ===================================================

    builder

      .addCase(fetchBrandSuggestions.pending, (state) => {
        state.brandSuggestions.loading = true;

        state.brandSuggestions.error = null;
      })

      .addCase(fetchBrandSuggestions.fulfilled, (state, action) => {
        state.brandSuggestions.loading = false;

        state.brandSuggestions.data = action.payload;
      })

      .addCase(fetchBrandSuggestions.rejected, (state, action) => {
        state.brandSuggestions.loading = false;

        state.brandSuggestions.error = action.payload;
      });

    // ===================================================
    // BRAND SERVICES
    // ===================================================

    builder

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
      });
    // ===================================================
    // SERVICE DETAIL
    // ===================================================

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

    // ===================================================
    // CREATE SERVICE
    // ===================================================

    builder

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

        if (!existsInServices) {
          state.services.count += 1;
        }

        if (!existsInBrandServices) {
          state.brandServices.count += 1;
        }

        state.operation.loading = false;

        state.operation.success = "Service created successfully";
      })

      .addCase(createEventService.rejected, (state, action) => {
        state.operation.loading = false;

        state.operation.error = action.payload;
      });

    // ===================================================
    // UPDATE SERVICE
    // ===================================================

    builder

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
      });

    // ===================================================
    // DELETE SERVICE
    // ===================================================

    builder

      .addCase(deleteEventService.pending, (state) => {
        state.operation.loading = true;

        state.operation.error = null;

        state.operation.success = null;
      })

      .addCase(deleteEventService.fulfilled, (state, action) => {
        const { serviceId, serviceName } = action.payload;

        const servicesLength = state.services.data.length;

        const brandServicesLength = state.brandServices.data.length;

        state.services.data = state.services.data.filter(
          (service) => !matchesService(service, serviceId, serviceName),
        );

        state.brandServices.data = state.brandServices.data.filter(
          (service) => !matchesService(service, serviceId, serviceName),
        );

        if (state.services.data.length < servicesLength) {
          state.services.count = Math.max(0, state.services.count - 1);
        }

        if (state.brandServices.data.length < brandServicesLength) {
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
      });

    // ===================================================
    // DELETE GALLERY IMAGE
    // ===================================================

    builder

      .addCase(deleteGalleryImage.pending, (state) => {
        state.operation.loading = true;

        state.operation.error = null;

        state.operation.success = null;
      })

      .addCase(deleteGalleryImage.fulfilled, (state, action) => {
        const { serviceId, serviceName, imageId } = action.payload;

        const removeImage = (service) => {
          if (!service?.gallery_images) {
            return;
          }

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

// =========================================================
// ACTION EXPORTS
// =========================================================

export const {
  // marketplace filters
  setServiceTypeFilter,
  setSearchFilter,
  setSellerFilter,
  setBrandFilter,
  setCurrentPage,
  setPageSize,

  // search selection
  setSelectedSeller,
  setSelectedBrand,
  clearSellerSearch,
  clearBrandSearch,

  // brand services
  setBrandServiceTypeFilter,
  setBrandSearchFilter,
  setBrandCurrentPage,

  // common
  clearCurrentService,
  clearOperationState,
  resetFilters,

  // gallery
  updateGalleryImageSortOrder,
} = eventServiceSlice.actions;

export default eventServiceSlice.reducer;
