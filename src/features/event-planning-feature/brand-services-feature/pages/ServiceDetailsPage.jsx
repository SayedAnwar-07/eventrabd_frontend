import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

  // Derived values
  const isOwner = service?.brand?.is_owner === true;

  const shouldOpenHireForm = location.state?.openHireForm === true;

  // Refresh current service after edit/update
  const refreshServiceDetail = () => {
    if (!brandSlug || !service) return;

    dispatch(
      fetchEventServiceDetail({
        brandSlug,
        serviceId: service.id,
        serviceName: service.slug || service.service_name || serviceName,
      }),
    );
  };

  // Fetch service details
  useEffect(() => {
    if (!brandSlug || !serviceId || !serviceName) {
      return;
    }

    dispatch(
      fetchEventServiceDetail({
        brandSlug,
        serviceId,
        serviceName,
      }),
    );
  }, [dispatch, brandSlug, serviceId, serviceName]);

  // Fetch full brand details for SellerInfo
  useEffect(() => {
    if (!brandSlug) {
      return;
    }

    dispatch(fetchBrandBySlug(brandSlug));

    return () => {
      dispatch(clearPublicBrandDetails());
    };
  }, [dispatch, brandSlug]);

  // Reset auto-open state when service changes
  useEffect(() => {
    autoOpenedRef.current = false;
  }, [serviceId]);

  // Automatically open HireSellerSheet
  useEffect(() => {
    if (
      !shouldOpenHireForm ||
      loading ||
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

      // Remove navigation state after opening
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
    loading,
    service,
    isOwner,
    navigate,
    location.pathname,
  ]);

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Error
  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Service not found.
      </div>
    );
  }

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
          {/* LEFT - Service Information */}
          <div className="min-w-0">
            <ServiceHero
              service={service}
              formatServiceName={formatServiceName}
            />
          </div>

          {/* RIGHT - Seller Information */}
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
