import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";

const HIRE_REQUESTS_URL = "/hire/requests";

const findFirstErrorMessage = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findFirstErrorMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (typeof value === "object") {
    const priorityKeys = ["message", "detail", "non_field_errors"];

    for (const key of priorityKeys) {
      if (value[key]) {
        const message = findFirstErrorMessage(value[key]);

        if (message) {
          return message;
        }
      }
    }

    for (const item of Object.values(value)) {
      const message = findFirstErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
};

/**
 * Convert every Axios/DRF error into:
 *
 * {
 *   message,
 *   status,
 *   code,
 *   errors,
 *   isNetworkError
 * }
 */
export const normalizeApiError = (
  error,
  fallbackMessage = "Something went wrong.",
) => {
  if (!error?.response) {
    return {
      message:
        "Unable to connect to the server. " +
        "Check your internet connection and try again.",
      status: null,
      code: "NETWORK_ERROR",
      errors: {},
      isNetworkError: true,
    };
  }

  const status = error.response.status;
  const responseData = error.response.data;

  if (typeof responseData === "string") {
    return {
      message: responseData || fallbackMessage,
      status,
      code: null,
      errors: {},
      isNetworkError: false,
    };
  }

  const errors = responseData?.errors ?? responseData ?? {};

  const message =
    responseData?.message ?? findFirstErrorMessage(errors) ?? fallbackMessage;

  return {
    message,
    status,
    code: responseData?.code ?? null,
    errors,
    isNetworkError: false,
  };
};

/**
 * Read a nested backend field error.
 *
 * Examples:
 * getHireFieldError(error, "service")
 * getHireFieldError(error, "booking_slots.0.starts_at")
 */
export const getHireFieldError = (apiError, fieldPath) => {
  if (!apiError?.errors || !fieldPath) {
    return null;
  }

  const value = fieldPath.split(".").reduce((currentValue, key) => {
    if (currentValue === null || currentValue === undefined) {
      return undefined;
    }

    return currentValue[key];
  }, apiError.errors);

  return findFirstErrorMessage(value);
};

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
      return rejectWithValue(
        normalizeApiError(error, "Unable to load hire requests."),
      );
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
      return rejectWithValue(
        normalizeApiError(error, "Unable to load this hire request."),
      );
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
      return rejectWithValue(
        normalizeApiError(error, "Unable to submit the hire request."),
      );
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
      return rejectWithValue(
        normalizeApiError(error, "Unable to accept the hire request."),
      );
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
      return rejectWithValue(
        normalizeApiError(error, "Unable to reject the hire request."),
      );
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
      return rejectWithValue(
        normalizeApiError(error, "Unable to delete the hire request."),
      );
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
    list: null,
    details: null,
    create: null,
    decision: null,
    delete: null,
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
          action.payload ?? {
            message: "Unable to load hire requests.",
            status: null,
            code: null,
            errors: {},
            isNetworkError: false,
          },
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
          action.payload ?? {
            message: "Unable to load this hire request.",
            status: null,
            code: null,
            errors: {},
            isNetworkError: false,
          },
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
          action.payload ?? {
            message: "Unable to submit the hire request.",
            status: null,
            code: null,
            errors: {},
            isNetworkError: false,
          },
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
          action.payload ?? {
            message: "Unable to accept the hire request.",
            status: null,
            code: null,
            errors: {},
            isNetworkError: false,
          },
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
          action.payload ?? {
            message: "Unable to reject the hire request.",
            status: null,
            code: null,
            errors: {},
            isNetworkError: false,
          },
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
          action.payload ?? {
            message: "Unable to delete the hire request.",
            status: null,
            code: null,
            errors: {},
            isNetworkError: false,
          },
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
