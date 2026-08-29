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
import LoadingSpinner from "@/components/common/LoadingSpinner";

const BrandDetailsPage = () => {
  const { slug } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { publicBrandDetails, publicDetails } = useSelector(
    (state) => state.eventPlanner,
  );

  const { accessToken, authInitialized } = useSelector((state) => state.auth);

  // ─────────────────────────────────────────────
  // Fetch brand
  // First request can load public data immediately.
  // When access token is restored, it fetches again
  // so backend can return correct is_owner.
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!slug) return;

    dispatch(fetchBrandBySlug(slug));
  }, [dispatch, slug, accessToken]);

  // ─────────────────────────────────────────────
  // Clear brand only when leaving/changing page
  //
  // IMPORTANT:
  // Don't put this cleanup inside the accessToken
  // dependent effect, otherwise existing brand data
  // disappears during authenticated refetch.
  // ─────────────────────────────────────────────

  useEffect(() => {
    return () => {
      dispatch(clearPublicBrandDetails());
    };
  }, [dispatch, slug]);

  // ─────────────────────────────────────────────
  // Slug redirect
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (publicDetails.redirectInfo?.newSlug) {
      navigate(`/event-planner/brands/${publicDetails.redirectInfo.newSlug}`, {
        replace: true,
      });
    }
  }, [publicDetails.redirectInfo, navigate]);

  // ─────────────────────────────────────────────
  // Refresh after creating service
  // ─────────────────────────────────────────────

  const handleServiceCreated = () => {
    if (!publicBrandDetails?.slug) return;

    dispatch(fetchBrandBySlug(publicBrandDetails.slug));
  };

  // ─────────────────────────────────────────────
  // Initial loading only
  //
  // If brand data already exists, don't hide the
  // whole page during ownership/auth refetch.
  // ─────────────────────────────────────────────

  if (publicDetails.loading && !publicBrandDetails) {
    return <LoadingSpinner text="Loading brand details..." />;
  }
  // ─────────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────────

  if (publicDetails.errorMessage && !publicBrandDetails) {
    return <BrandPageState>{publicDetails.errorMessage}</BrandPageState>;
  }

  // ─────────────────────────────────────────────
  // Not found
  // ─────────────────────────────────────────────

  if (!publicBrandDetails) {
    return <BrandPageState>Brand not found.</BrandPageState>;
  }

  // ─────────────────────────────────────────────
  // Action ownership loading
  //
  // 1. Auth is still restoring
  // OR
  // 2. Brand is being refetched while old/public
  //    brand data is already visible.
  // ─────────────────────────────────────────────

  const actionsLoading =
    !authInitialized || (publicDetails.loading && Boolean(publicBrandDetails));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full pb-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* LEFT */}
          <div className="min-w-0">
            <BrandHeader
              brand={publicBrandDetails}
              actionsLoading={actionsLoading}
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

        {/* SERVICES */}
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
