import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import {
  fetchHireDetails,
  selectHireDetailsError,
  selectHireDetailsLoading,
  selectSelectedHire,
} from "@/store/features/hire/hireSlice";

export default function useHireDetails() {
  const { hireId, id } = useParams();
  const dispatch = useDispatch();

  const selectedHireId = hireId || id;

  const hire = useSelector(selectSelectedHire);
  const loading = useSelector(selectHireDetailsLoading);
  const error = useSelector(selectHireDetailsError);

  useEffect(() => {
    if (!selectedHireId) {
      return undefined;
    }

    const request = dispatch(fetchHireDetails(selectedHireId));

    return () => {
      request.abort?.();
    };
  }, [dispatch, selectedHireId]);

  const retry = () => {
    if (!selectedHireId || loading) {
      return;
    }

    dispatch(fetchHireDetails(selectedHireId));
  };

  return {
    hire,
    loading,
    error,
    retry,
    hireId: selectedHireId,
  };
}
