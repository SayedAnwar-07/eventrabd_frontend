export const selectBrands = (state) => state.eventPlanner.brands;

export const selectPublicBrandDetails = (state) =>
  state.eventPlanner.publicBrandDetails;

export const selectMyBrandDetails = (state) =>
  state.eventPlanner.myBrandDetails;

export const selectBrandListState = (state) => state.eventPlanner.list;

export const selectPublicBrandDetailsState = (state) =>
  state.eventPlanner.publicDetails;

export const selectMyBrandState = (state) => state.eventPlanner.myBrand;

export const selectCreateBrandState = (state) => state.eventPlanner.create;

export const selectUpdateBrandState = (state) => state.eventPlanner.update;

export const selectDeleteBrandState = (state) => state.eventPlanner.delete;

// export const selectBrandPagination = (state) => state.eventPlanner.pagination;
