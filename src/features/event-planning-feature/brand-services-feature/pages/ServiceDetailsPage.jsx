import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import LoadingSpinner from "@/components/common/LoadingSpinner";

// Store
import { fetchEventServiceDetail } from "@/store/features/eventService/eventServiceSlice";

import {
  clearPublicBrandDetails,
  fetchBrandBySlug,
} from "@/store/features/eventPlanner/eventPlannerSlice";

import {
  selectCurrentService,
  selectCurrentServiceError,
  selectCurrentServiceGallery,
  selectCurrentServiceLoading,
} from "@/store/features/eventService/eventServiceSelector";

// Service Details Components
import ServiceBreadcrumb from "../components/ServiceDetails/ServiceBreadcrumb";
import ServiceFloatingActions from "../components/ServiceDetails/ServiceFloatingActions";
import ServiceGalleryCarousel from "../components/ServiceDetails/ServiceGalleryCarousel";
import ServiceHero from "../components/ServiceDetails/ServiceHero";
import SellerInfo from "../components/ServiceDetails/SellerInfo";

// Feature Components
import PackagesDetails from "@/features/packages/components/PackagesDetails";
import ServiceReviews from "@/features/review/components/ServiceReviews";

const formatServiceName = (name = "") =>
  name.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const ServiceDetailsPage = () => {
  // Router
  const { brandSlug, serviceId, serviceName } = useParams();

  const navigate = useNavigate();
  const location = useLocation();

  // Redux
  const dispatch = useDispatch();

  // Refs
  const hireSheetRef = useRef(null);
  const autoOpenedRef = useRef(false);

  // Service state
  const service = useSelector(selectCurrentService);
  const galleryImages = useSelector(selectCurrentServiceGallery);
  const loading = useSelector(selectCurrentServiceLoading);
  const error = useSelector(selectCurrentServiceError);

  // Brand state
  const { publicBrandDetails } = useSelector((state) => state.eventPlanner);

  // Auth state
  const { accessToken, authInitialized } = useSelector((state) => state.auth);

  /*
   * Stores the last service/auth combination
   * that successfully completed an authenticated fetch.
   */
  const [verifiedOwnershipKey, setVerifiedOwnershipKey] = useState(null);

  // Current ownership identity
  const ownershipKey = accessToken
    ? `${brandSlug}:${serviceId}:${serviceName}:${accessToken}`
    : null;

  // Backend ownership
  const isOwner = service?.brand?.is_owner === true;

  /*
   * Show the small action loader when:
   *
   * 1. Auth is still restoring
   * OR
   * 2. User is authenticated but authenticated
   *    service details haven't finished yet.
   */
  const actionsLoading =
    !authInitialized ||
    (Boolean(accessToken) && verifiedOwnershipKey !== ownershipKey);

  const shouldOpenHireForm = location.state?.openHireForm === true;

  // =====================================================
  // FETCH SERVICE DETAILS
  // =====================================================
  //
  // First render:
  // accessToken = null
  // → public service data loads immediately.
  //
  // After auth restore:
  // accessToken changes
  // → effect runs again
  // → authenticated service data loads
  // → correct is_owner arrives.
  // =====================================================

  useEffect(() => {
    if (!brandSlug || !serviceId || !serviceName) {
      return;
    }

    let cancelled = false;

    const currentOwnershipKey = accessToken
      ? `${brandSlug}:${serviceId}:${serviceName}:${accessToken}`
      : null;

    const request = dispatch(
      fetchEventServiceDetail({
        brandSlug,
        serviceId,
        serviceName,
      }),
    );

    request.then((result) => {
      if (
        cancelled ||
        !currentOwnershipKey ||
        !fetchEventServiceDetail.fulfilled.match(result)
      ) {
        return;
      }

      /*
       * This runs after the async request completes.
       * It is NOT a synchronous setState inside effect.
       */
      setVerifiedOwnershipKey(currentOwnershipKey);
    });

    return () => {
      cancelled = true;

      // Prevent an old public request from overwriting
      // a newer authenticated request.
      request.abort();
    };
  }, [dispatch, brandSlug, serviceId, serviceName, accessToken]);

  // =====================================================
  // FETCH BRAND DETAILS
  // =====================================================
  //
  // Also refetch when accessToken becomes available
  // so SellerInfo gets authenticated brand information.
  // =====================================================

  useEffect(() => {
    if (!brandSlug) {
      return;
    }

    const request = dispatch(fetchBrandBySlug(brandSlug));

    return () => {
      request.abort();
    };
  }, [dispatch, brandSlug, accessToken]);

  // =====================================================
  // CLEAR BRAND WHEN LEAVING PAGE
  // =====================================================

  useEffect(() => {
    return () => {
      dispatch(clearPublicBrandDetails());
    };
  }, [dispatch, brandSlug]);

  // =====================================================
  // REFRESH SERVICE AFTER EDIT
  // =====================================================

  const refreshServiceDetail = () => {
    if (!brandSlug || !service) {
      return;
    }

    dispatch(
      fetchEventServiceDetail({
        brandSlug,
        serviceId: service.id,
        serviceName: service.slug || service.service_name || serviceName,
      }),
    );
  };

  // =====================================================
  // RESET AUTO OPEN
  // =====================================================

  useEffect(() => {
    autoOpenedRef.current = false;
  }, [serviceId]);

  // =====================================================
  // AUTO OPEN HIRE SHEET
  // =====================================================

  useEffect(() => {
    if (
      !shouldOpenHireForm ||
      actionsLoading ||
      !service ||
      isOwner ||
      autoOpenedRef.current
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const triggerButton = hireSheetRef.current?.querySelector("button");

      if (!triggerButton) {
        return;
      }

      autoOpenedRef.current = true;

      triggerButton.click();

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [
    shouldOpenHireForm,
    actionsLoading,
    service,
    isOwner,
    navigate,
    location.pathname,
  ]);

  // =====================================================
  // INITIAL LOADING
  // =====================================================

  if (loading && !service) {
    return <LoadingSpinner size="md" text="Loading service..." />;
  }

  // First render before pending reducer executes
  if (!service && !error) {
    return <LoadingSpinner size="md" text="Loading service..." />;
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Service not found.
      </div>
    );
  }

  if (!service) {
    return null;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-400">
        {/* Breadcrumb */}
        <ServiceBreadcrumb
          brandSlug={brandSlug}
          brandName={service?.brand?.display_name}
          serviceName={formatServiceName(service?.service_name)}
        />

        {/* Gallery */}
        <ServiceGalleryCarousel
          service={service}
          galleryImages={galleryImages}
        />

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* LEFT */}
          <div className="min-w-0">
            <ServiceHero
              service={service}
              formatServiceName={formatServiceName}
            />
          </div>

          {/* RIGHT */}
          <aside className="w-full lg:sticky lg:top-6">
            <SellerInfo brand={publicBrandDetails} />
          </aside>
        </div>

        {/* Packages */}
        <PackagesDetails service={service} />

        {/* Reviews */}
        <div className="mt-12">
          <ServiceReviews service={service} />
        </div>

        {/* Floating Actions */}
        <ServiceFloatingActions
          service={service}
          brandSlug={brandSlug}
          isOwner={isOwner}
          actionsLoading={actionsLoading}
          hireSheetRef={hireSheetRef}
          onServiceUpdated={refreshServiceDetail}
          onServiceDeleted={() =>
            navigate(`/event-planner/brands/${brandSlug}`)
          }
        />
      </div>
    </main>
  );
};

export default ServiceDetailsPage;
