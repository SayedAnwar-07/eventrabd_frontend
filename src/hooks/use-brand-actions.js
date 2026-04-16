import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBrands,
  fetchBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/store/features/eventPlanner/eventPlannerSlice";
import {
  selectBrands,
  selectBrandDetails,
  selectBrandListState,
  selectBrandDetailsState,
  selectCreateBrandState,
  selectUpdateBrandState,
  selectDeleteBrandState,
} from "@/store/features/eventPlanner/eventPlannerSelectors";

export function useBrandActions() {
  const dispatch = useDispatch();

  const brands = useSelector(selectBrands);
  const brandDetails = useSelector(selectBrandDetails);
  const listState = useSelector(selectBrandListState);
  const detailsState = useSelector(selectBrandDetailsState);
  const createState = useSelector(selectCreateBrandState);
  const updateState = useSelector(selectUpdateBrandState);
  const deleteState = useSelector(selectDeleteBrandState);

  return useMemo(
    () => ({
      brands,
      brandDetails,
      listState,
      detailsState,
      createState,
      updateState,
      deleteState,
      fetchBrands: () => dispatch(fetchBrands()),
      fetchBrandBySlug: (slug) => dispatch(fetchBrandBySlug(slug)),
      createBrand: (payload) => dispatch(createBrand(payload)),
      updateBrand: ({ slug, payload }) =>
        dispatch(updateBrand({ slug, payload })),
      deleteBrand: (slug) => dispatch(deleteBrand(slug)),
    }),
    [
      dispatch,
      brands,
      brandDetails,
      listState,
      detailsState,
      createState,
      updateState,
      deleteState,
    ],
  );
}
