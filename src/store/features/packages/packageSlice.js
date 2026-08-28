import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import getApiErrorPayload from "@/store/constant/getApiErrorPayload";

const getResponseData = (response) => {
  return response?.data?.data ?? response?.data;
};

const getPackageList = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// ── Async thunks ──────────────────────────────────────────────────────────────

export const fetchPackagesByService = createAsyncThunk(
  "packages/fetchPackagesByService",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/packages/services/${serviceId}/packages/`,
      );

      return {
        serviceId,
        packages: getPackageList(response),
      };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

export const createPackage = createAsyncThunk(
  "packages/createPackage",
  async ({ serviceId, packageData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/packages/services/${serviceId}/packages/`,
        packageData,
      );

      return {
        serviceId,
        package: getResponseData(response),
      };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

export const updatePackage = createAsyncThunk(
  "packages/updatePackage",
  async ({ serviceId, packageId, packageData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/packages/services/${serviceId}/packages/${packageId}/`,
        packageData,
      );

      return {
        serviceId,
        packageId,
        package: getResponseData(response),
      };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

export const deletePackage = createAsyncThunk(
  "packages/deletePackage",
  async ({ serviceId, packageId }, { rejectWithValue }) => {
    try {
      await api.delete(
        `/packages/services/${serviceId}/packages/${packageId}/`,
      );

      return {
        serviceId,
        packageId,
      };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error));
    }
  },
);

// ── Initial state ──────────────────────────────────────────────────────────────

const initialState = {
  packagesByService: {},
  loadingByService: {},

  creating: false,
  updating: false,
  deleting: false,

  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const packageSlice = createSlice({
  name: "packages",

  initialState,

  reducers: {
    clearPackageError: (state) => {
      state.error = null;
    },

    clearPackagesForService: (state, action) => {
      const serviceId = action.payload;

      delete state.packagesByService[serviceId];
      delete state.loadingByService[serviceId];
    },

    resetPackages: () => initialState,
  },

  extraReducers: (builder) => {
    builder

      // ── Fetch ───────────────────────────────────────────────────────────────
      .addCase(fetchPackagesByService.pending, (state, action) => {
        const serviceId = action.meta.arg;

        state.loadingByService[serviceId] = true;
        state.error = null;
      })

      .addCase(fetchPackagesByService.fulfilled, (state, action) => {
        const { serviceId, packages } = action.payload;

        state.loadingByService[serviceId] = false;

        state.packagesByService[serviceId] = packages;
      })

      .addCase(fetchPackagesByService.rejected, (state, action) => {
        const serviceId = action.meta.arg;

        state.loadingByService[serviceId] = false;

        state.error = action.payload ?? action.error;
      })

      // ── Create ──────────────────────────────────────────────────────────────
      .addCase(createPackage.pending, (state) => {
        state.creating = true;
        state.error = null;
      })

      .addCase(createPackage.fulfilled, (state, action) => {
        const { serviceId, package: createdPackage } = action.payload;

        state.creating = false;

        if (!state.packagesByService[serviceId]) {
          state.packagesByService[serviceId] = [];
        }

        state.packagesByService[serviceId].push(createdPackage);
      })

      .addCase(createPackage.rejected, (state, action) => {
        state.creating = false;

        state.error = action.payload ?? action.error;
      })

      // ── Update ──────────────────────────────────────────────────────────────
      .addCase(updatePackage.pending, (state) => {
        state.updating = true;
        state.error = null;
      })

      .addCase(updatePackage.fulfilled, (state, action) => {
        const {
          serviceId,
          packageId,
          package: updatedPackage,
        } = action.payload;

        state.updating = false;

        const packages = state.packagesByService[serviceId];

        if (!packages) {
          return;
        }

        const index = packages.findIndex((item) => item.id === packageId);

        if (index !== -1) {
          packages[index] = updatedPackage;
        }
      })

      .addCase(updatePackage.rejected, (state, action) => {
        state.updating = false;

        state.error = action.payload ?? action.error;
      })

      // ── Delete ──────────────────────────────────────────────────────────────
      .addCase(deletePackage.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })

      .addCase(deletePackage.fulfilled, (state, action) => {
        const { serviceId, packageId } = action.payload;

        state.deleting = false;

        const packages = state.packagesByService[serviceId];

        if (!packages) {
          return;
        }

        state.packagesByService[serviceId] = packages.filter(
          (item) => item.id !== packageId,
        );
      })

      .addCase(deletePackage.rejected, (state, action) => {
        state.deleting = false;

        state.error = action.payload ?? action.error;
      });
  },
});

export const { clearPackageError, clearPackagesForService, resetPackages } =
  packageSlice.actions;

const EMPTY_PACKAGES = [];

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectPackagesByService = (state, serviceId) =>
  state.packages.packagesByService[serviceId] ?? EMPTY_PACKAGES;

export const selectPackageCountByService = (state, serviceId) =>
  state.packages.packagesByService[serviceId]?.length ?? 0;

export const selectPackagesLoading = (state, serviceId) =>
  state.packages.loadingByService[serviceId] ?? false;

export const selectPackageCreating = (state) => state.packages.creating;

export const selectPackageUpdating = (state) => state.packages.updating;

export const selectPackageDeleting = (state) => state.packages.deleting;

export const selectPackageError = (state) => state.packages.error;

export default packageSlice.reducer;
