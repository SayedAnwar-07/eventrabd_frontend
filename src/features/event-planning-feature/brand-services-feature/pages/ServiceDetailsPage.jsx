import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { fetchEventServiceDetail } from "@/store/features/eventService/eventServiceSlice";

import {
  selectCurrentService,
  selectCurrentServiceLoading,
  selectCurrentServiceError,
  selectCurrentServiceGallery,
} from "@/store/features/eventService/eventServiceSelector";

import ServiceDelete from "../components/ServiceDelete";
import EventServiceSheet from "../components/services-create-update/EventServiceSheet";

import ServiceBreadcrumb from "../components/ServiceDetails/ServiceBreadcrumb";
import ServiceGalleryCarousel from "../components/ServiceDetails/ServiceGalleryCarousel";
import ServiceSummary from "../components/ServiceDetails/ServiceSummary";
import ServiceHero from "../components/ServiceDetails/ServiceHero";

import HireSellerSheet from "@/features/hire/components/HireRequestSheet";

import ServiceReviews from "@/features/review/components/ServiceReviews";
import PackagesDetails from "@/features/packages/components/PackagesDetails";
import { Pencil, Trash2 } from "lucide-react";

const formatServiceName = (name = "") =>
  name.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const ServiceDetailsPage = () => {
  const { brandSlug, serviceId, serviceName } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const hireSheetRef = useRef(null);
  const autoOpenedRef = useRef(false);

  const service = useSelector(selectCurrentService);
  const galleryImages = useSelector(selectCurrentServiceGallery);
  const loading = useSelector(selectCurrentServiceLoading);
  const error = useSelector(selectCurrentServiceError);

  const isOwner = service?.brand?.is_owner === true;

  const shouldOpenHireForm = location.state?.openHireForm === true;

  const refreshServiceDetail = () => {
    dispatch(
      fetchEventServiceDetail({
        brandSlug,
        serviceId: service?.id || serviceId,
        serviceName: service?.slug || service?.service_name || serviceName,
      }),
    );
  };

  useEffect(() => {
    if (brandSlug && serviceId && serviceName) {
      dispatch(
        fetchEventServiceDetail({
          brandSlug,
          serviceId,
          serviceName,
        }),
      );
    }
  }, [dispatch, brandSlug, serviceId, serviceName]);

  // Automatically open existing HireSellerSheet
  // after service detail has finished loading.
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

      if (!triggerButton) return;

      autoOpenedRef.current = true;

      triggerButton.click();

      // Remove navigation state only AFTER opening the sheet.
      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [
    shouldOpenHireForm,
    loading,
    service,
    isOwner,
    navigate,
    location.pathname,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Service not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-400 px-4 sm:px-6 lg:px-8">
        <ServiceBreadcrumb
          brandSlug={brandSlug}
          brandName={service.brand?.display_name}
          serviceName={formatServiceName(service.service_name)}
        />

        <ServiceGalleryCarousel
          service={service}
          galleryImages={galleryImages}
        />

        {/* Service Details */}
        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ServiceHero
              service={service}
              formatServiceName={formatServiceName}
            />

            {/* Packages */}
            <PackagesDetails service={service} />
          </div>

          <aside className="h-fit lg:top-24">
            <ServiceSummary
              service={service}
              formatServiceName={formatServiceName}
            />

            {!isOwner && (
              <div ref={hireSheetRef} className="mt-4">
                <HireSellerSheet service={service} />
              </div>
            )}

            {isOwner && (
              <div className="mt-4 flex gap-3">
                <EventServiceSheet
                  brandSlug={brandSlug}
                  service={service}
                  serviceId={service.id}
                  serviceName={service.slug || service.service_name}
                  onSuccess={refreshServiceDetail}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  }
                />

                <ServiceDelete
                  brandSlug={brandSlug}
                  serviceId={service.id}
                  serviceName={service.slug || service.service_name}
                  serviceTitle={formatServiceName(service.service_name)}
                  onSuccess={() =>
                    navigate(`/event-planner/brands/${brandSlug}`)
                  }
                  trigger={
                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  }
                />
              </div>
            )}
          </aside>
        </section>

        {/* Reviews */}
        <div className="mt-12">
          <ServiceReviews service={service} />
        </div>
      </div>
    </main>
  );
};

export default ServiceDetailsPage;
