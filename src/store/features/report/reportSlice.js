import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import { getApiErrorMessage } from "@/store/constant/getApiErrorMessage";

const initialState = {
  reports: [],
  currentReport: null,

  loading: false,
  detailLoading: false,
  creating: false,

  error: null,
  createError: null,
};

// Handles both:
// direct DRF response
// { ... }
//
// and wrapped response
// { success: true, data: ... }
const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

const getReportList = (response) => {
  const data = getResponseData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Fetch logged-in customer's reports
// GET /reports/
// ─────────────────────────────────────────────────────────────────────────────

export const fetchMyReports = createAsyncThunk(
  "report/fetchMyReports",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/");

      return getReportList(response);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Fetch one customer report
// GET /reports/{reportId}/
// ─────────────────────────────────────────────────────────────────────────────

export const fetchReportDetail = createAsyncThunk(
  "report/fetchReportDetail",
  async (reportId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reports/${reportId}/`);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Create customer report
// POST /reports/create/
//
// Backend accepts ONLY:
// hire
// message
// image
//
// Never send:
// reporter
// service
// status
// report_count
// ─────────────────────────────────────────────────────────────────────────────

export const createReport = createAsyncThunk(
  "report/createReport",
  async ({ hireId, message, image = null }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      formData.append("hire", hireId);
      formData.append("message", message.trim());

      if (image) {
        formData.append("image", image);
      }

      const response = await api.post("/reports/create/", formData);

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error));
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const reportSlice = createSlice({
  name: "report",

  initialState,

  reducers: {
    clearReportError: (state) => {
      state.error = null;
      state.createError = null;
    },

    clearCurrentReport: (state) => {
      state.currentReport = null;
      state.detailLoading = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // ── My Reports ──────────────────────────────────────────────────────────

      .addCase(fetchMyReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
        state.error = null;
      })

      .addCase(fetchMyReports.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Unable to load your reports. Please try again.";
      })

      // ── Report Detail ───────────────────────────────────────────────────────

      .addCase(fetchReportDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
        state.currentReport = null;
      })

      .addCase(fetchReportDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentReport = action.payload;
        state.error = null;
      })

      .addCase(fetchReportDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.currentReport = null;
        state.error =
          action.payload || "Unable to load this report. Please try again.";
      })

      // ── Create Report ───────────────────────────────────────────────────────

      .addCase(createReport.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })

      .addCase(createReport.fulfilled, (state, action) => {
        state.creating = false;
        state.createError = null;

        const createdReport = action.payload;

        if (!createdReport) {
          return;
        }

        state.currentReport = createdReport;

        const alreadyExists = state.reports.some(
          (report) => report.id === createdReport.id,
        );

        if (!alreadyExists) {
          state.reports.unshift(createdReport);
        }
      })

      .addCase(createReport.rejected, (state, action) => {
        state.creating = false;
        state.createError =
          action.payload || "Unable to submit your report. Please try again.";
      });
  },
});

export const { clearReportError, clearCurrentReport } = reportSlice.actions;

export default reportSlice.reducer;
