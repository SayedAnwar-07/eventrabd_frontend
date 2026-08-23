import { createSelector } from "@reduxjs/toolkit";

// ── Base ─────────────────────────────────────────────

export const selectEventServicesState = (state) => state.eventServices;

// ── Services ─────────────────────────────────────────

export const selectAllServices = (state) =>
  selectEventServicesState(state).services.data;

export const selectServicesLoading = (state) =>
  selectEventServicesState(state).services.loading;

export const selectServicesError = (state) =>
  selectEventServicesState(state).services.error;

export const selectServicesPagination = createSelector(
  [selectEventServicesState],
  ({ services, filters }) => ({
    count: services.count,
    next: services.next,
    previous: services.previous,
    currentPage: filters.currentPage,
    pageSize: filters.pageSize,
  }),
);

export const selectServicesWithPagination = createSelector(
  [selectAllServices, selectServicesPagination],
  (results, pagination) => ({
    results,
    ...pagination,
  }),
);

// ── Public Services ───────────────────────────────────

export const selectPublicServices = selectAllServices;

export const selectDivisionOptions = createSelector(
  [selectAllServices],
  (services) => {
    const divisions = {};

    services.forEach((service) => {
      service.brand?.division?.forEach((division) => {
        divisions[division] = (divisions[division] || 0) + 1;
      });
    });

    return divisions;
  },
);

export const selectPublicServicesLoading = selectServicesLoading;

export const selectPublicServicesError = selectServicesError;

export const selectPublicServicesPagination = selectServicesPagination;

// ── Brand Services ───────────────────────────────────

export const selectBrandServices = (state) =>
  selectEventServicesState(state).brandServices.data;

export const selectBrandServicesLoading = (state) =>
  selectEventServicesState(state).brandServices.loading;

export const selectBrandServicesError = (state) =>
  selectEventServicesState(state).brandServices.error;

export const selectBrandServicesPagination = createSelector(
  [selectEventServicesState],
  ({ brandServices, brandFilters }) => ({
    count: brandServices.count,
    next: brandServices.next,
    previous: brandServices.previous,
    currentPage: brandFilters.currentPage,
    pageSize: brandFilters.pageSize,
  }),
);

// ── Current Service ──────────────────────────────────

export const selectCurrentService = (state) =>
  selectEventServicesState(state).currentService.data;

export const selectCurrentServiceLoading = (state) =>
  selectEventServicesState(state).currentService.loading;

export const selectCurrentServiceError = (state) =>
  selectEventServicesState(state).currentService.error;

export const selectCurrentServiceGallery = createSelector(
  [selectCurrentService],
  (service) => service?.gallery_images ?? [],
);

export const selectCurrentServiceImageLimit = createSelector(
  [selectCurrentService],
  (service) => service?.image_limit ?? 0,
);

// ── Filters ──────────────────────────────────────────

export const selectFilters = (state) => selectEventServicesState(state).filters;

export const selectBrandFilters = (state) =>
  selectEventServicesState(state).brandFilters;

export const selectServiceTypeFilter = (state) =>
  selectFilters(state).serviceType;

export const selectSearchFilter = (state) => selectFilters(state).search;

export const selectDivisionFilter = (state) => selectFilters(state).division;

export const selectSellerFilter = (state) => selectFilters(state).sellerId;

// ── Service Type Options ─────────────────────────────

export const selectServiceTypeOptions = () => [
  {
    value: "photography",
    label: "Photography",
  },
  {
    value: "videography",
    label: "Videography",
  },
  {
    value: "stage_designer",
    label: "Stage Designer",
  },
  {
    value: "sound_lighting",
    label: "Sound System and Lighting",
  },
  {
    value: "event_hall",
    label: "Event Hall",
  },
];

// ── Operation ────────────────────────────────────────

export const selectOperationState = (state) =>
  selectEventServicesState(state).operation;

export const selectOperationLoading = (state) =>
  selectOperationState(state).loading;

export const selectOperationError = (state) =>
  selectOperationState(state).error;

export const selectOperationSuccess = (state) =>
  selectOperationState(state).success;

// ── Computed Selectors ───────────────────────────────

export const selectServicesByType = (serviceType) =>
  createSelector([selectAllServices], (services) =>
    services.filter((service) => service.service_name === serviceType),
  );

export const selectServicesByBrand = (brandSlug) =>
  createSelector([selectAllServices], (services) =>
    services.filter((service) => service.brand?.slug === brandSlug),
  );

export const selectServiceBySlug = (slug) =>
  createSelector([selectAllServices], (services) =>
    services.find((service) => service.slug === slug),
  );

export const selectServiceById = (id) =>
  createSelector([selectAllServices], (services) =>
    services.find((service) => service.id === id),
  );

export const selectServiceTypeStats = createSelector(
  [selectAllServices],
  (services) =>
    services.reduce((acc, service) => {
      const type = service.service_name;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
);

export const selectUniqueBrands = createSelector(
  [selectAllServices],
  (services) => {
    const brands = new Map();

    services.forEach((service) => {
      if (service.brand?.id) {
        brands.set(service.brand.id, service.brand);
      }
    });

    return [...brands.values()];
  },
);

export const selectIsServiceLoading = (slug) =>
  createSelector(
    [selectOperationLoading, selectCurrentService],
    (loading, service) => service?.slug === slug && loading,
  );

// ── Simple Computed State ────────────────────────────

export const selectTotalServicesCount = (state) =>
  selectEventServicesState(state).services.count;

export const selectHasMoreServices = (state) =>
  selectEventServicesState(state).services.next !== null;

export const selectIsLoading = createSelector(
  [
    selectServicesLoading,
    selectBrandServicesLoading,
    selectCurrentServiceLoading,
    selectOperationLoading,
  ],
  (...loadingStates) => loadingStates.some(Boolean),
);

export const selectError = createSelector(
  [
    selectServicesError,
    selectBrandServicesError,
    selectCurrentServiceError,
    selectOperationError,
  ],
  (...errors) => errors.find(Boolean) || null,
);

// Seller autocomplete
export const selectSellerSuggestions = (state) =>
  selectEventServicesState(state).sellerSuggestions.data;

export const selectSellerSuggestionsLoading = (state) =>
  selectEventServicesState(state).sellerSuggestions.loading;

export const selectSellerSuggestionsError = (state) =>
  selectEventServicesState(state).sellerSuggestions.error;

// Brand autocomplete
export const selectBrandSuggestions = (state) =>
  selectEventServicesState(state).brandSuggestions.data;

export const selectBrandSuggestionsLoading = (state) =>
  selectEventServicesState(state).brandSuggestions.loading;

export const selectBrandSuggestionsError = (state) =>
  selectEventServicesState(state).brandSuggestions.error;

// Selected seller
export const selectSelectedSeller = (state) =>
  selectEventServicesState(state).selectedSeller;

// Selected brand
export const selectSelectedBrand = (state) =>
  selectEventServicesState(state).selectedBrand;
