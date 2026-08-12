import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import api from "@/store/constant/api";
import getApiErrorMessage from "@/store/constant/getApiErrorMessage";

const REVIEWS_URL = "/reviews/";

const getReviewDetailUrl = (reviewId) => {
  return `${REVIEWS_URL}${encodeURIComponent(reviewId)}/`;
};

const getServiceReviewsUrl = (serviceId) => {
  return `${REVIEWS_URL}services/${encodeURIComponent(serviceId)}/`;
};

const getReviewEligibilityUrl = (hireId) => {
  return `${REVIEWS_URL}hires/${encodeURIComponent(hireId)}/eligibility/`;
};

// ── Response helpers ──────────────────────────────────────────────────────────

const getResponseData = (response) => {
  return response?.data?.data ?? response?.data ?? null;
};

const normalizeReviewListResponse = (data) => {
  if (Array.isArray(data)) {
    return {
      reviews: data,
      count: data.length,
      next: null,
      previous: null,
    };
  }

  if (Array.isArray(data?.results)) {
    return {
      reviews: data.results,
      count: data.count ?? data.results.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    };
  }

  return {
    reviews: [],
    count: 0,
    next: null,
    previous: null,
  };
};

const findReviewIndex = (reviews, reviewId) => {
  return reviews.findIndex((review) => String(review.id) === String(reviewId));
};

// ── Multipart helper ──────────────────────────────────────────────────────────

const hasFile = (value) => {
  if (!value) {
    return false;
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }

  return typeof Blob !== "undefined" && value instanceof Blob;
};

const prepareReviewData = (data) => {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return data;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return data;
  }

  if (!hasFile(data.image)) {
    return data;
  }

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

// ── Service Review List ───────────────────────────────────────────────────────

export const fetchServiceReviews = createAsyncThunk(
  "review/fetchServiceReviews",
  async (
    { serviceId, page = 1, pageSize = 15 },
    { rejectWithValue, signal },
  ) => {
    if (!serviceId) {
      return rejectWithValue("Service ID is required.");
    }

    try {
      const response = await api.get(getServiceReviewsUrl(serviceId), {
        params: {
          page,
          page_size: pageSize,
        },
        signal,
      });

      const data = getResponseData(response);

      return {
        serviceId,
        ...normalizeReviewListResponse(data),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load reviews."),
      );
    }
  },
);

// ── Review Detail ─────────────────────────────────────────────────────────────

export const fetchReviewDetails = createAsyncThunk(
  "review/fetchReviewDetails",
  async (reviewId, { rejectWithValue, signal }) => {
    if (!reviewId) {
      return rejectWithValue("Review ID is required.");
    }

    try {
      const response = await api.get(getReviewDetailUrl(reviewId), {
        signal,
      });

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to load review details."),
      );
    }
  },
);

// ── Create Review ─────────────────────────────────────────────────────────────

export const createReview = createAsyncThunk(
  "review/createReview",
  async (reviewData, { rejectWithValue, signal }) => {
    if (!reviewData?.hire) {
      return rejectWithValue("Hire ID is required.");
    }

    try {
      const payload = prepareReviewData(reviewData);

      const response = await api.post(REVIEWS_URL, payload, {
        signal,
      });

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to submit your review."),
      );
    }
  },
);

// ── Update Review ─────────────────────────────────────────────────────────────

export const updateReview = createAsyncThunk(
  "review/updateReview",
  async ({ reviewId, data }, { rejectWithValue, signal }) => {
    if (!reviewId) {
      return rejectWithValue("Review ID is required.");
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return rejectWithValue("Valid review update data is required.");
    }

    if (Object.keys(data).length === 0) {
      return rejectWithValue("No review changes were provided.");
    }

    try {
      const payload = prepareReviewData(data);

      const response = await api.patch(getReviewDetailUrl(reviewId), payload, {
        signal,
      });

      return getResponseData(response);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to update your review."),
      );
    }
  },
);

// ── Delete Review ─────────────────────────────────────────────────────────────

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (reviewId, { rejectWithValue, signal }) => {
    if (!reviewId) {
      return rejectWithValue("Review ID is required.");
    }

    try {
      await api.delete(getReviewDetailUrl(reviewId), {
        signal,
      });

      return {
        reviewId,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to delete your review."),
      );
    }
  },
);

// ── Review Eligibility ────────────────────────────────────────────────────────

export const fetchReviewEligibility = createAsyncThunk(
  "review/fetchReviewEligibility",
  async (hireId, { rejectWithValue, signal }) => {
    if (!hireId) {
      return rejectWithValue("Hire ID is required.");
    }

    try {
      const response = await api.get(getReviewEligibilityUrl(hireId), {
        signal,
      });

      return {
        hireId,
        data: getResponseData(response),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Unable to check review eligibility."),
      );
    }
  },
);

// ── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  reviews: [],
  selectedReview: null,

  currentServiceId: null,

  count: 0,
  next: null,
  previous: null,

  eligibility: null,
  eligibilityHireId: null,

  loading: false,
  detailsLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  eligibilityLoading: false,

  error: null,
  successMessage: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const reviewSlice = createSlice({
  name: "review",
  initialState,

  reducers: {
    clearReviewError: (state) => {
      state.error = null;
    },

    clearReviewSuccessMessage: (state) => {
      state.successMessage = null;
    },

    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },

    clearReviewEligibility: (state) => {
      state.eligibility = null;
      state.eligibilityHireId = null;
    },

    clearServiceReviews: (state) => {
      state.reviews = [];
      state.currentServiceId = null;
      state.count = 0;
      state.next = null;
      state.previous = null;
    },

    resetReviewState: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // ─────────────────────────────────────────────────────────────
      // Service review list
      // ─────────────────────────────────────────────────────────────

      .addCase(fetchServiceReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchServiceReviews.fulfilled, (state, action) => {
        state.loading = false;

        state.currentServiceId = action.payload.serviceId;
        state.reviews = action.payload.reviews;
        state.count = action.payload.count;
        state.next = action.payload.next;
        state.previous = action.payload.previous;
      })

      .addCase(fetchServiceReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unable to load reviews.";
      })

      // ─────────────────────────────────────────────────────────────
      // Review detail
      // ─────────────────────────────────────────────────────────────

      .addCase(fetchReviewDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
        state.selectedReview = null;
      })

      .addCase(fetchReviewDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.selectedReview = action.payload;

        const reviewIndex = findReviewIndex(state.reviews, action.payload?.id);

        if (reviewIndex !== -1) {
          state.reviews[reviewIndex] = action.payload;
        }
      })

      .addCase(fetchReviewDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload || "Unable to load review details.";
      })

      // ─────────────────────────────────────────────────────────────
      // Create review
      // ─────────────────────────────────────────────────────────────

      .addCase(createReview.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(createReview.fulfilled, (state, action) => {
        state.createLoading = false;
        state.selectedReview = action.payload;

        const review = action.payload;

        if (
          review &&
          state.currentServiceId &&
          String(review.service_id) === String(state.currentServiceId)
        ) {
          const existingIndex = findReviewIndex(state.reviews, review.id);

          if (existingIndex === -1) {
            state.reviews.unshift(review);
            state.count += 1;
          } else {
            state.reviews[existingIndex] = review;
          }
        }

        state.eligibility = {
          can_review: false,
          service_ids: [],
          review_id: review?.id ?? null,
        };

        state.successMessage = "Review submitted successfully.";
      })

      .addCase(createReview.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Unable to submit your review.";
      })

      // ─────────────────────────────────────────────────────────────
      // Update review
      // ─────────────────────────────────────────────────────────────

      .addCase(updateReview.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(updateReview.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.selectedReview = action.payload;

        const reviewIndex = findReviewIndex(state.reviews, action.payload?.id);

        if (reviewIndex !== -1) {
          state.reviews[reviewIndex] = action.payload;
        }

        state.successMessage = "Review updated successfully.";
      })

      .addCase(updateReview.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || "Unable to update your review.";
      })

      // ─────────────────────────────────────────────────────────────
      // Delete review
      // ─────────────────────────────────────────────────────────────

      .addCase(deleteReview.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
        state.successMessage = null;
      })

      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleteLoading = false;

        const reviewId = action.payload.reviewId;

        const reviewIndex = findReviewIndex(state.reviews, reviewId);

        if (reviewIndex !== -1) {
          state.reviews.splice(reviewIndex, 1);
          state.count = Math.max(state.count - 1, 0);
        }

        if (String(state.selectedReview?.id) === String(reviewId)) {
          state.selectedReview = null;
        }

        state.successMessage = "Review deleted successfully.";
      })

      .addCase(deleteReview.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload || "Unable to delete your review.";
      })

      // ─────────────────────────────────────────────────────────────
      // Review eligibility
      // ─────────────────────────────────────────────────────────────

      .addCase(fetchReviewEligibility.pending, (state) => {
        state.eligibilityLoading = true;
        state.error = null;
        state.eligibility = null;
      })

      .addCase(fetchReviewEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;

        state.eligibilityHireId = action.payload.hireId;
        state.eligibility = action.payload.data;
      })

      .addCase(fetchReviewEligibility.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.error = action.payload || "Unable to check review eligibility.";
      });
  },
});

// ── Actions ───────────────────────────────────────────────────────────────────

export const {
  clearReviewError,
  clearReviewSuccessMessage,
  clearSelectedReview,
  clearReviewEligibility,
  clearServiceReviews,
  resetReviewState,
} = reviewSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectReviews = (state) => state.review.reviews;

export const selectSelectedReview = (state) => state.review.selectedReview;

export const selectReviewCurrentServiceId = (state) =>
  state.review.currentServiceId;

export const selectReviewLoading = (state) => state.review.loading;

export const selectReviewDetailsLoading = (state) =>
  state.review.detailsLoading;

export const selectReviewCreateLoading = (state) => state.review.createLoading;

export const selectReviewUpdateLoading = (state) => state.review.updateLoading;

export const selectReviewDeleteLoading = (state) => state.review.deleteLoading;

export const selectReviewEligibilityLoading = (state) =>
  state.review.eligibilityLoading;

export const selectReviewEligibility = (state) => state.review.eligibility;

export const selectReviewError = (state) => state.review.error;

export const selectReviewSuccessMessage = (state) =>
  state.review.successMessage;

export const selectReviewPagination = (state) => ({
  count: state.review.count,
  next: state.review.next,
  previous: state.review.previous,
});

export const selectReviewById = (state, reviewId) => {
  return state.review.reviews.find(
    (review) => String(review.id) === String(reviewId),
  );
};

export default reviewSlice.reducer;
