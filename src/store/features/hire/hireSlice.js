import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";

/**
 * Convert DRF/Axios errors into a predictable value.
 */
const getApiError = (error) => {
  if (!error.response) {
    return {
      message: "Unable to connect to the server.",
    };
  }

  const responseData = error.response.data;

  if (typeof responseData === "string") {
    return {
      message: responseData,
    };
  }

  return (
    responseData || {
      message: "Something went wrong.",
    }
  );
};

/**
 * GET /hire/
 *
 * Seller: receives hires belonging to their services.
 * Customer: receives their own hires.
 * Admin: receives all hires.
 */
export const fetchHires = createAsyncThunk(
  "hire/fetchHires",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/hire/");

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  },
);

/**
 * GET /hire/{hireId}/
 */
export const fetchHireDetails = createAsyncThunk(
  "hire/fetchHireDetails",
  async (hireId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/hire/${hireId}/`);

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  },
);

/**
 * POST /hire/
 *
 * Payload:
 * {
 *   service,
 *   customer_note,
 *   booking_slots
 * }
 */
export const createHire = createAsyncThunk(
  "hire/createHire",
  async (hireData, { rejectWithValue }) => {
    try {
      const response = await api.post("/hire/", hireData);

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  },
);

/**
 * POST /hire/{hireId}/decision/
 *
 * Payload:
 * {
 *   hireId,
 *   decision: "accept" | "reject",
 *   seller_note
 * }
 */
export const submitHireDecision = createAsyncThunk(
  "hire/submitHireDecision",
  async ({ hireId, decision, seller_note = "" }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/hire/${hireId}/decision/`, {
        decision,
        seller_note,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  },
);

/**
 * DELETE /hire/{hireId}/
 *
 * Customers can delete only their own seller-rejected hire requests.
 */
export const deleteHire = createAsyncThunk(
  "hire/deleteHire",
  async (hireId, { rejectWithValue }) => {
    try {
      await api.delete(`/hire/${hireId}/`);

      return hireId;
    } catch (error) {
      return rejectWithValue(getApiError(error));
    }
  },
);

const getInitialState = () => ({
  hires: [],
  selectedHire: null,

  listLoading: false,
  detailsLoading: false,
  createLoading: false,
  decisionLoading: false,

  /**
   * Stores the ID of the hire currently being accepted/rejected.
   * This prevents every request card from showing a loading state.
   */
  decisionHireId: null,

  error: null,

  createSuccess: false,
  decisionSuccess: false,

  deleteLoading: false,
  deleteHireId: null,
  deleteSuccess: false,
});

const hireSlice = createSlice({
  name: "hire",

  initialState: getInitialState(),

  reducers: {
    clearHireError: (state) => {
      state.error = null;
    },

    clearSelectedHire: (state) => {
      state.selectedHire = null;
      state.detailsLoading = false;
    },

    resetCreateHireState: (state) => {
      state.createLoading = false;
      state.createSuccess = false;
      state.error = null;
    },

    resetHireDecisionState: (state) => {
      state.decisionLoading = false;
      state.decisionHireId = null;
      state.decisionSuccess = false;
      state.error = null;
    },

    resetDeleteHireState: (state) => {
      state.deleteLoading = false;
      state.deleteHireId = null;
      state.deleteSuccess = false;
      state.error = null;
    },

    resetHireState: () => getInitialState(),
  },

  extraReducers: (builder) => {
    builder
      // ============================================================
      // Fetch hire list
      // ============================================================
      .addCase(fetchHires.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })

      .addCase(fetchHires.fulfilled, (state, action) => {
        state.listLoading = false;

        /**
         * Supports:
         * 1. Normal array response
         * 2. DRF paginated response: { results: [] }
         */
        state.hires = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.results || [];
      })

      .addCase(fetchHires.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload || {
          message: "Unable to load hire requests.",
        };
      })

      // ============================================================
      // Fetch one hire
      // ============================================================
      .addCase(fetchHireDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })

      .addCase(fetchHireDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedHire = action.payload;
      })

      .addCase(fetchHireDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || {
          message: "Unable to load the hire request.",
        };
      })

      // ============================================================
      // Create hire
      // ============================================================
      .addCase(createHire.pending, (state) => {
        state.createLoading = true;
        state.createSuccess = false;
        state.error = null;
      })

      .addCase(createHire.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;

        /**
         * Use the real response returned by the backend.
         * Never create a fake hire object on the frontend.
         */
        state.hires.unshift(action.payload);
        state.selectedHire = action.payload;
      })

      .addCase(createHire.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.error = action.payload || {
          message: "Unable to submit the hire request.",
        };
      })

      // ============================================================
      // Accept or reject hire
      // ============================================================
      .addCase(submitHireDecision.pending, (state, action) => {
        state.decisionLoading = true;
        state.decisionHireId = action.meta.arg.hireId;
        state.decisionSuccess = false;
        state.error = null;
      })

      .addCase(submitHireDecision.fulfilled, (state, action) => {
        state.decisionLoading = false;
        state.decisionHireId = null;
        state.decisionSuccess = true;

        const updatedHire = action.payload;

        /**
         * Replace the existing list item with the actual updated
         * hire returned by Django REST Framework.
         */
        const hireIndex = state.hires.findIndex(
          (hire) => hire.id === updatedHire.id,
        );

        if (hireIndex !== -1) {
          state.hires[hireIndex] = updatedHire;
        }

        /**
         * Also update the currently selected hire when the hire
         * details page is open.
         */
        if (state.selectedHire?.id === updatedHire.id) {
          state.selectedHire = updatedHire;
        }
      })

      .addCase(submitHireDecision.rejected, (state, action) => {
        state.decisionLoading = false;
        state.decisionHireId = null;
        state.decisionSuccess = false;
        state.error = action.payload || {
          message: "Unable to update the hire request.",
        };
      })

      // ============================================================
      // Delete rejected hire
      // ============================================================
      .addCase(deleteHire.pending, (state, action) => {
        state.deleteLoading = true;
        state.deleteHireId = action.meta.arg;
        state.deleteSuccess = false;
        state.error = null;
      })

      .addCase(deleteHire.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteHireId = null;
        state.deleteSuccess = true;

        const deletedHireId = action.payload;

        state.hires = state.hires.filter((hire) => hire.id !== deletedHireId);

        if (state.selectedHire?.id === deletedHireId) {
          state.selectedHire = null;
        }
      })

      .addCase(deleteHire.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteHireId = null;
        state.deleteSuccess = false;
        state.error = action.payload || {
          message: "Unable to delete the hire request.",
        };
      });
  },
});

export const {
  clearHireError,
  clearSelectedHire,
  resetCreateHireState,
  resetHireDecisionState,
  resetDeleteHireState,
  resetHireState,
} = hireSlice.actions;

// ================================================================
// Selectors
// ================================================================

export const selectHires = (state) => state.hire.hires;

export const selectSelectedHire = (state) => state.hire.selectedHire;

export const selectHireError = (state) => state.hire.error;

export const selectHireListLoading = (state) => state.hire.listLoading;

export const selectHireDetailsLoading = (state) => state.hire.detailsLoading;

export const selectCreateHireLoading = (state) => state.hire.createLoading;

export const selectCreateHireSuccess = (state) => state.hire.createSuccess;

export const selectHireDecisionLoading = (state) => state.hire.decisionLoading;

export const selectDecisionHireId = (state) => state.hire.decisionHireId;

export const selectHireDecisionSuccess = (state) => state.hire.decisionSuccess;

export const selectDeleteHireLoading = (state) => state.hire.deleteLoading;

export const selectDeleteHireId = (state) => state.hire.deleteHireId;

export const selectDeleteHireSuccess = (state) => state.hire.deleteSuccess;

export default hireSlice.reducer;
