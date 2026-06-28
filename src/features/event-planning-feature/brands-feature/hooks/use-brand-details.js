import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchBrandBySlug,
  clearBrandDetails,
} from "@/store/features/eventPlanner/eventPlannerSlice";

export default function useBrandDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { brandDetails, details } = useSelector((state) => state.eventPlanner);

  useEffect(() => {
    if (!slug) return;

    dispatch(clearBrandDetails());
    dispatch(fetchBrandBySlug(slug));

    return () => {
      dispatch(clearBrandDetails());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (!details.redirectInfo?.newSlug) return;

    navigate(`/event-planner/brands/${details.redirectInfo.newSlug}`, {
      replace: true,
    });
  }, [details.redirectInfo, navigate]);

  return {
    brandDetails,
    details,
  };
}
