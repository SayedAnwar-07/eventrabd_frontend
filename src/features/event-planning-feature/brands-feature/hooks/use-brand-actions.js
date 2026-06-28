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
  selectPublicBrandDetails,
  selectMyBrandDetails,
  selectBrandListState,
  selectPublicBrandDetailsState,
  selectMyBrandState,
  selectCreateBrandState,
  selectUpdateBrandState,
  selectDeleteBrandState,
} from "@/store/features/eventPlanner/eventPlannerSelectors";

export function useBrandActions() {
  const dispatch = useDispatch();

  const brands = useSelector(selectBrands);

  const publicBrandDetails = useSelector(selectPublicBrandDetails);
  const myBrandDetails = useSelector(selectMyBrandDetails);

  const listState = useSelector(selectBrandListState);

  const publicDetailsState = useSelector(selectPublicBrandDetailsState);
  const myBrandState = useSelector(selectMyBrandState);

  const createState = useSelector(selectCreateBrandState);
  const updateState = useSelector(selectUpdateBrandState);
  const deleteState = useSelector(selectDeleteBrandState);

  return useMemo(
    () => ({
      brands,

      publicBrandDetails,
      myBrandDetails,

      listState,

      publicDetailsState,
      myBrandState,

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

      publicBrandDetails,
      myBrandDetails,

      listState,

      publicDetailsState,
      myBrandState,

      createState,
      updateState,
      deleteState,
    ],
  );
}
