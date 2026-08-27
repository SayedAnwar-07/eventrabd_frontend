import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  fetchBrandBySlug,
  clearPublicBrandDetails,
} from "@/store/features/eventPlanner/eventPlannerSlice";

import BrandHeader from "../components/brandDetails/BrandHeader";
import BrandServicesSection from "../components/brandDetails/BrandServicesSection";
import BrandPageState from "../components/brandDetails/BrandPageState";
import BrandSidebarPanel from "../components/brandDetails/Brandsidebarpanel";

const BrandDetailsPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { publicBrandDetails, publicDetails } = useSelector(
    (state) => state.eventPlanner,
  );

  // console.log(publicBrandDetails);

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
      <main className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* LEFT */}
          <div className="min-w-0">
            <BrandHeader
              brand={publicBrandDetails}
              onEdit={() =>
                navigate(
                  `/event-planner/brands/${publicBrandDetails.slug}/edit`,
                )
              }
            />
          </div>

          {/* RIGHT */}
          <aside className="w-full lg:sticky lg:top-24">
            <BrandSidebarPanel
              brand={publicBrandDetails}
              services={
                Array.isArray(publicBrandDetails.services)
                  ? publicBrandDetails.services
                  : []
              }
            />
          </aside>
        </div>

        {/* services */}
        <div>
          <BrandServicesSection
            brand={publicBrandDetails}
            onServiceCreated={handleServiceCreated}
          />
        </div>
      </main>
    </div>
  );
};

export default BrandDetailsPage;
