import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchBrandBySlug,
  clearPublicBrandDetails,
} from "@/store/features/eventPlanner/eventPlannerSlice";

import BrandHeader from "../components/BrandHeader";
import BrandSidebarPanel from "../components/BrandSidebarPanel";
import BrandServicesSection from "../components/BrandServicesSection";
import BrandPageState from "../components/BrandPageState";

const BrandDetailsPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { publicBrandDetails, publicDetails } = useSelector(
    (state) => state.eventPlanner,
  );

  useEffect(() => {
    if (slug) dispatch(fetchBrandBySlug(slug));

    return () => dispatch(clearPublicBrandDetails());
  }, [dispatch, slug]);

  useEffect(() => {
    if (publicDetails.redirectInfo?.newSlug) {
      navigate(`/event-planner/brands/${publicDetails.redirectInfo.newSlug}`, {
        replace: true,
      });
    }
  }, [publicDetails.redirectInfo, navigate]);

  const handleServiceCreated = () => {
    if (publicBrandDetails?.slug) {
      dispatch(fetchBrandBySlug(publicBrandDetails.slug));
    }
  };

  if (publicDetails.loading) {
    return <BrandPageState>Loading brand details…</BrandPageState>;
  }

  if (publicDetails.errorMessage) {
    return <BrandPageState>{publicDetails.errorMessage}</BrandPageState>;
  }

  if (!publicBrandDetails) {
    return <BrandPageState>Brand not found.</BrandPageState>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <BrandHeader
          brand={publicBrandDetails}
          onEdit={() =>
            navigate(`/event-planner/brands/${publicBrandDetails.slug}/edit`)
          }
        />

        <div className="grid grid-cols-1 gap-10 py-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <BrandServicesSection
              brand={publicBrandDetails}
              onServiceCreated={handleServiceCreated}
            />
          </div>

          <div className="lg:sticky lg:top-8 lg:h-fit">
            <BrandSidebarPanel brand={publicBrandDetails} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandDetailsPage;