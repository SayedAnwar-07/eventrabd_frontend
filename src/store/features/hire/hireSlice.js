import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import { getApiErrorMessage } from "@/store/constant/getApiErrorMessage";

const HIRE_REQUESTS_URL = "/hire/requests";

const replaceHireInState = (state, updatedHire) => {
  const hireIndex = state.hires.findIndex((hire) => hire.id === updatedHire.id);

  if (hireIndex !== -1) {
    state.hires[hireIndex] = updatedHire;
  } else {
    state.hires.unshift(updatedHire);
  }

  if (state.selectedHire?.id === updatedHire.id) {
    state.selectedHire = updatedHire;
  }
};

const setOperationError = (state, operation, error) => {
  state.error = error;
  state.errors[operation] = error;
};

const clearOperationError = (state, operation) => {
  state.error = null;
  state.errors[operation] = null;
};

/**
 * GET /hire/requests/
 */
export const fetchHires = createAsyncThunk(
  "hire/fetchHires",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${HIRE_REQUESTS_URL}/`);

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/**
 * GET /hire/requests/{hireId}/
 */
export const fetchHireDetails = createAsyncThunk(
  "hire/fetchHireDetails",
  async (hireId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${HIRE_REQUESTS_URL}/${hireId}/`);

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/**
 * POST /hire/requests/create/
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
      const response = await api.post(`${HIRE_REQUESTS_URL}/create/`, hireData);

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/**
 * POST /hire/requests/{hireId}/accept/
 *
 * Payload:
 * {
 *   hireId,
 *   seller_note
 * }
 */
export const acceptHire = createAsyncThunk(
  "hire/acceptHire",
  async ({ hireId, seller_note = "" }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${HIRE_REQUESTS_URL}/${hireId}/accept/`,
        {
          seller_note,
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/**
 * POST /hire/requests/{hireId}/reject/
 *
 * Payload:
 * {
 *   hireId,
 *   seller_note
 * }
 */
export const rejectHire = createAsyncThunk(
  "hire/rejectHire",
  async ({ hireId, seller_note = "" }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `${HIRE_REQUESTS_URL}/${hireId}/reject/`,
        {
          seller_note,
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

/**
 * DELETE /hire/requests/{hireId}/delete/
 */
export const deleteHire = createAsyncThunk(
  "hire/deleteHire",
  async (hireId, { rejectWithValue }) => {
    try {
      await api.delete(`${HIRE_REQUESTS_URL}/${hireId}/delete/`);

      return hireId;
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
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
  deleteLoading: false,

  decisionHireId: null,
  decisionAction: null,
  deleteHireId: null,

  createSuccess: false,
  decisionSuccess: false,
  deleteSuccess: false,

  /**
   * Last error, preserved for existing components.
   */
  error: null,

  /**
   * Operation-specific errors prevent one request from
   * overwriting unrelated UI errors.
   */
  errors: {
    list: "",
    details: "",
    create: "",
    decision: "",
    delete: "",
  },
});

const hireSlice = createSlice({
  name: "hire",

  initialState: getInitialState(),

  reducers: {
    clearHireError: (state) => {
      state.error = null;

      state.errors = {
        list: null,
        details: null,
        create: null,
        decision: null,
        delete: null,
      };
    },

    clearHireOperationError: (state, action) => {
      const operation = action.payload;

      if (operation && operation in state.errors) {
        state.errors[operation] = null;
      }

      state.error = null;
    },

    clearSelectedHire: (state) => {
      state.selectedHire = null;
      state.detailsLoading = false;
      state.errors.details = null;
    },

    resetCreateHireState: (state) => {
      state.createLoading = false;
      state.createSuccess = false;
      state.errors.create = null;
      state.error = null;
    },

    resetHireDecisionState: (state) => {
      state.decisionLoading = false;
      state.decisionHireId = null;
      state.decisionAction = null;
      state.decisionSuccess = false;
      state.errors.decision = null;
      state.error = null;
    },

    resetDeleteHireState: (state) => {
      state.deleteLoading = false;
      state.deleteHireId = null;
      state.deleteSuccess = false;
      state.errors.delete = null;
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
        clearOperationError(state, "list");
      })

      .addCase(fetchHires.fulfilled, (state, action) => {
        state.listLoading = false;

        state.hires = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.results ?? []);
      })

      .addCase(fetchHires.rejected, (state, action) => {
        state.listLoading = false;

        setOperationError(
          state,
          "list",
          action.payload || "Unable to load hire requests.",
        );
      })

      // ============================================================
      // Fetch hire details
      // ============================================================
      .addCase(fetchHireDetails.pending, (state) => {
        state.detailsLoading = true;
        clearOperationError(state, "details");
      })

      .addCase(fetchHireDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedHire = action.payload;
      })

      .addCase(fetchHireDetails.rejected, (state, action) => {
        state.detailsLoading = false;

        setOperationError(
          state,
          "details",
          action.payload || "Unable to load hire requests.",
        );
      })

      // ============================================================
      // Create hire
      // ============================================================
      .addCase(createHire.pending, (state) => {
        state.createLoading = true;
        state.createSuccess = false;
        clearOperationError(state, "create");
      })

      .addCase(createHire.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;

        replaceHireInState(state, action.payload);
        state.selectedHire = action.payload;
      })

      .addCase(createHire.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;

        setOperationError(
          state,
          "create",
          action.payload || "Unable to load hire requests.",
        );
      })

      // ============================================================
      // Accept hire
      // ============================================================
      .addCase(acceptHire.pending, (state, action) => {
        state.decisionLoading = true;
        state.decisionHireId = action.meta.arg.hireId;
        state.decisionAction = "accept";
        state.decisionSuccess = false;

        clearOperationError(state, "decision");
      })

      .addCase(acceptHire.fulfilled, (state, action) => {
        state.decisionLoading = false;
        state.decisionHireId = null;
        state.decisionAction = null;
        state.decisionSuccess = true;

        replaceHireInState(state, action.payload);
      })

      .addCase(acceptHire.rejected, (state, action) => {
        state.decisionLoading = false;
        state.decisionHireId = null;
        state.decisionAction = null;
        state.decisionSuccess = false;

        setOperationError(
          state,
          "decision",
          action.payload || "Unable to load hire requests.",
        );
      })

      // ============================================================
      // Reject hire
      // ============================================================
      .addCase(rejectHire.pending, (state, action) => {
        state.decisionLoading = true;
        state.decisionHireId = action.meta.arg.hireId;
        state.decisionAction = "reject";
        state.decisionSuccess = false;

        clearOperationError(state, "decision");
      })

      .addCase(rejectHire.fulfilled, (state, action) => {
        state.decisionLoading = false;
        state.decisionHireId = null;
        state.decisionAction = null;
        state.decisionSuccess = true;

        replaceHireInState(state, action.payload);
      })

      .addCase(rejectHire.rejected, (state, action) => {
        state.decisionLoading = false;
        state.decisionHireId = null;
        state.decisionAction = null;
        state.decisionSuccess = false;

        setOperationError(
          state,
          "decision",
          action.payload || "Unable to load hire requests.",
        );
      })

      // ============================================================
      // Delete rejected hire
      // ============================================================
      .addCase(deleteHire.pending, (state, action) => {
        state.deleteLoading = true;
        state.deleteHireId = action.meta.arg;
        state.deleteSuccess = false;

        clearOperationError(state, "delete");
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

        setOperationError(
          state,
          "delete",
          action.payload || "Unable to load hire requests.",
        );
      });
  },
});

export const {
  clearHireError,
  clearHireOperationError,
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

export const selectHireErrors = (state) => state.hire.errors;

export const selectHireListError = (state) => state.hire.errors.list;

export const selectHireDetailsError = (state) => state.hire.errors.details;

export const selectCreateHireError = (state) => state.hire.errors.create;

export const selectHireDecisionError = (state) => state.hire.errors.decision;

export const selectDeleteHireError = (state) => state.hire.errors.delete;

export const selectHireListLoading = (state) => state.hire.listLoading;

export const selectHireDetailsLoading = (state) => state.hire.detailsLoading;

export const selectCreateHireLoading = (state) => state.hire.createLoading;

export const selectCreateHireSuccess = (state) => state.hire.createSuccess;

export const selectHireDecisionLoading = (state) => state.hire.decisionLoading;

export const selectDecisionHireId = (state) => state.hire.decisionHireId;

export const selectHireDecisionAction = (state) => state.hire.decisionAction;

export const selectHireDecisionSuccess = (state) => state.hire.decisionSuccess;

export const selectDeleteHireLoading = (state) => state.hire.deleteLoading;

export const selectDeleteHireId = (state) => state.hire.deleteHireId;

export const selectDeleteHireSuccess = (state) => state.hire.deleteSuccess;

export default hireSlice.reducer;
