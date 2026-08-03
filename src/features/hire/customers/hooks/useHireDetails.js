import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearSelectedHire,
  fetchHireDetails,
  selectSelectedHire,
  selectHireDetailsLoading,
  selectHireDetailsError,
} from "@/store/features/hire/hireSlice";

export function useHireDetails(id) {
  const dispatch = useDispatch();

  const hire = useSelector(selectSelectedHire);

  const loading = useSelector(selectHireDetailsLoading);

  const error = useSelector(selectHireDetailsError);

  useEffect(() => {
    dispatch(clearSelectedHire());

    if (id) {
      dispatch(fetchHireDetails(id));
    }

    return () => {
      dispatch(clearSelectedHire());
    };
  }, [dispatch, id]);

  const retry = () => {
    if (!id || loading) {
      return;
    }

    dispatch(fetchHireDetails(id));
  };

  return {
    hire,

    loading,

    error,

    retry,
  };
}
