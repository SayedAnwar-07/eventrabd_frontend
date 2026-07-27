import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import getApiErrorMessage from "@/store/constant/getApiErrorMessage";

const INVOICES_URL = "/invoices/";

const getInvoiceDetailUrl = (invoiceId) => {
  return `${INVOICES_URL}${encodeURIComponent(invoiceId)}/`;
};
const getInvoiceDecisionUrl = (invoiceId) => {
  return `${getInvoiceDetailUrl(invoiceId)}customer-decision/`;
};

const normalizeInvoiceListResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      invoices: data,
      count: data.length,
      next: null,
      previous: null,
    };
  }

  if (Array.isArray(data?.results)) {
    return {
      invoices: data.results,
      count: data.count ?? data.results.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }

  return {
    invoices: [],
    count: 0,
    next: null,
    previous: null,
  };
};

const findInvoiceIndex = (invoices, invoiceId) => {
  return invoices.findIndex(
    (invoice) => String(invoice.id) === String(invoiceId),
  );
};

export const fetchInvoices = createAsyncThunk(
  "invoice/fetchInvoices",
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      const response = await api.get(INVOICES_URL, {
        params,
        signal,
      });

      return normalizeInvoiceListResponse(response.data);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load invoices."),
      );
    }
  },
);

export const fetchInvoiceDetails = createAsyncThunk(
  "invoice/fetchInvoiceDetails",
  async (invoiceId, { rejectWithValue, signal }) => {
    if (!invoiceId) {
      return rejectWithValue("Invoice ID is required.");
    }

    try {
      const response = await api.get(getInvoiceDetailUrl(invoiceId), {
        signal,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load invoice details."),
      );
    }
  },
);

export const createInvoice = createAsyncThunk(
  "invoice/createInvoice",
  async (invoiceData, { rejectWithValue, signal }) => {
    if (!invoiceData?.hire) {
      return rejectWithValue("An accepted hire must be selected.");
    }

    try {
      const response = await api.post(INVOICES_URL, invoiceData, {
        signal,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to create the invoice."),
      );
    }
  },
);

export const updateInvoice = createAsyncThunk(
  "invoice/updateInvoice",
  async ({ invoiceId, data }, { rejectWithValue, signal }) => {
    if (!invoiceId) {
      return rejectWithValue("Invoice ID is required.");
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return rejectWithValue("Valid invoice update data is required.");
    }

    if (Object.keys(data).length === 0) {
      return rejectWithValue("No invoice changes were provided.");
    }

    try {
      const response = await api.patch(getInvoiceDetailUrl(invoiceId), data, {
        signal,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to update the invoice."),
      );
    }
  },
);

export const submitInvoiceDecision = createAsyncThunk(
  "invoice/submitInvoiceDecision",
  async ({ invoiceId, customerAgreed }, { rejectWithValue, signal }) => {
    if (!invoiceId) {
      return rejectWithValue("Invoice ID is required.");
    }

    if (typeof customerAgreed !== "boolean") {
      return rejectWithValue("A valid invoice decision is required.");
    }

    try {
      const response = await api.post(
        getInvoiceDecisionUrl(invoiceId),
        {
          customer_agreed: customerAgreed,
        },
        {
          signal,
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to submit your invoice decision."),
      );
    }
  },
);

const initialState = {
  invoices: [],
  selectedInvoice: null,

  count: 0,
  next: null,
  previous: null,

  loading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,

  decisionLoading: false,

  error: null,
  successMessage: null,
};

const invoiceSlice = createSlice({
  name: "invoice",
  initialState,

  reducers: {
    clearInvoiceError: (state) => {
      state.error = null;
    },

    clearInvoiceSuccessMessage: (state) => {
      state.successMessage = null;
    },

    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
    },

    resetInvoiceState: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // ─────────────────────────────────────────────────────────────
      // Fetch invoice list
      // ─────────────────────────────────────────────────────────────

      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;

        state.invoices = action.payload.invoices;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })

      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load invoices.";
      })

      // ─────────────────────────────────────────────────────────────
      // Fetch one invoice
      // ─────────────────────────────────────────────────────────────

      .addCase(fetchInvoiceDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
        state.selectedInvoice = null;
      })

      .addCase(fetchInvoiceDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedInvoice = action.payload;

        const invoiceIndex = findInvoiceIndex(
          state.invoices,
          action.payload.id,
        );

        if (invoiceIndex !== -1) {
          state.invoices[invoiceIndex] = action.payload;
        }
      })

      .addCase(fetchInvoiceDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Unable to load invoice details.";
      })

      // ─────────────────────────────────────────────────────────────
      // Create invoice
      // ─────────────────────────────────────────────────────────────

      .addCase(createInvoice.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(createInvoice.fulfilled, (state, action) => {
        state.createLoading = false;
        state.selectedInvoice = action.payload;

        const existingInvoiceIndex = findInvoiceIndex(
          state.invoices,
          action.payload.id,
        );

        if (existingInvoiceIndex === -1) {
          state.invoices.unshift(action.payload);
          state.count += 1;
        } else {
          state.invoices[existingInvoiceIndex] = action.payload;
        }

        state.successMessage = "Invoice created successfully.";
      })

      .addCase(createInvoice.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Unable to create the invoice.";
      })

      // ─────────────────────────────────────────────────────────────
      // Update invoice with PATCH
      // ─────────────────────────────────────────────────────────────

      .addCase(updateInvoice.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.selectedInvoice = action.payload;

        const invoiceIndex = findInvoiceIndex(
          state.invoices,
          action.payload.id,
        );

        if (invoiceIndex !== -1) {
          state.invoices[invoiceIndex] = action.payload;
        }

        state.successMessage = "Invoice updated successfully.";
      })

      .addCase(updateInvoice.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Unable to update the invoice.";
      })

      // ─────────────────────────────────────────────────────────────
      // Customer invoice decision
      // ─────────────────────────────────────────────────────────────

      .addCase(submitInvoiceDecision.pending, (state) => {
        state.decisionLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(submitInvoiceDecision.fulfilled, (state, action) => {
        state.decisionLoading = false;
        state.selectedInvoice = action.payload;

        const invoiceIndex = findInvoiceIndex(
          state.invoices,
          action.payload.id,
        );

        if (invoiceIndex !== -1) {
          state.invoices[invoiceIndex] = action.payload;
        }

        state.successMessage =
          action.meta.arg.customerAgreed === true
            ? "You agreed with the invoice."
            : "You disagreed with the invoice.";
      })

      .addCase(submitInvoiceDecision.rejected, (state, action) => {
        state.decisionLoading = false;
        state.error =
          action.payload || "Unable to submit your invoice decision.";
      });
  },
});

export const {
  clearInvoiceError,
  clearInvoiceSuccessMessage,
  clearSelectedInvoice,
  resetInvoiceState,
} = invoiceSlice.actions;

export const selectInvoices = (state) => state.invoice.invoices;

export const selectSelectedInvoice = (state) => state.invoice.selectedInvoice;

export const selectInvoiceLoading = (state) => state.invoice.loading;

export const selectInvoiceDetailsLoading = (state) =>
  state.invoice.detailsLoading;

export const selectInvoiceCreateLoading = (state) =>
  state.invoice.createLoading;

export const selectInvoiceUpdateLoading = (state) =>
  state.invoice.updateLoading;

export const selectInvoiceDecisionLoading = (state) =>
  state.invoice.decisionLoading;

export const selectInvoiceError = (state) => state.invoice.error;

export const selectInvoiceSuccessMessage = (state) =>
  state.invoice.successMessage;

export const selectInvoicePagination = (state) => ({
  count: state.invoice.count,
  next: state.invoice.next,
  previous: state.invoice.previous,
});

export const selectInvoiceById = (state, invoiceId) => {
  return state.invoice.invoices.find(
    (invoice) => String(invoice.id) === String(invoiceId),
  );
};

export default invoiceSlice.reducer;
