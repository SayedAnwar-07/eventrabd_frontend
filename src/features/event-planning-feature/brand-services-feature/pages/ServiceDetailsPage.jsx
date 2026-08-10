import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchEventServiceDetail } from "@/store/features/eventService/eventServiceSlice";

import {
  selectCurrentService,
  selectCurrentServiceLoading,
  selectCurrentServiceError,
  selectCurrentServiceGallery,
} from "@/store/features/eventService/eventServiceSelector";

import ServiceDelete from "../components/ServiceDelete";
import EventServiceSheet from "../components/event-service-sheet/EventServiceSheet";

import ServiceBreadcrumb from "../components/ServiceDetails/ServiceBreadcrumb";
import ServiceGalleryCarousel from "../components/ServiceDetails/ServiceGalleryCarousel";
import ServiceSummary from "../components/ServiceDetails/ServiceSummary";
import ServiceHero from "../components/ServiceDetails/ServiceHero";

import HireSellerSheet from "@/features/hire/sellers/components/HireSellerSheet";

const formatServiceName = (name = "") =>
  name.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const ServiceDetailsPage = () => {
  const { brandSlug, serviceId, serviceName } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const service = useSelector(selectCurrentService);
  const galleryImages = useSelector(selectCurrentServiceGallery);

  const loading = useSelector(selectCurrentServiceLoading);
  const error = useSelector(selectCurrentServiceError);

  const isOwner = service?.brand?.is_owner === true;

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Service not found.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ServiceBreadcrumb
          brandSlug={brandSlug}
          brandName={service.brand?.brand_name}
          serviceName={formatServiceName(service.service_name)}
        />

        <ServiceGalleryCarousel
          service={service}
          galleryImages={galleryImages}
        />

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ServiceHero
              service={service}
              formatServiceName={formatServiceName}
            />
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <ServiceSummary
              service={service}
              formatServiceName={formatServiceName}
            />

            {!isOwner && (
              <div className="mt-4">
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
                    <button className="flex-1 border rounded-md py-3 text-sm font-semibold">
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
                    <button className="flex-1 bg-destructive text-white rounded-md py-3 text-sm font-semibold">
                      Delete
                    </button>
                  }
                />
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ServiceDetailsPage;
