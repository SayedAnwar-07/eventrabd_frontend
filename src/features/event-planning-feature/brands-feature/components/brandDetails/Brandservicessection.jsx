import ServiceCard from "@/features/event-planning-feature/brand-services-feature/components/ServiceCard";
import EventServiceSheet from "@/features/event-planning-feature/brand-services-feature/components/event-service-sheet/EventServiceSheet";

const BrandServicesSection = ({ brand, onServiceCreated }) => {
  const services = brand.services || [];

  return (
    <section>
      <div className="my-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">
          Available Services
        </h2>

        {brand.is_owner && (
          <EventServiceSheet
            brandSlug={brand.slug}
            trigger={
              <button
                type="button"
                className="border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-foreground"
              >
                + Create Service
              </button>
            }
            onSuccess={onServiceCreated}
          />
        )}
      </div>

      {services.length === 0 ? (
        <div className="border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No services added yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              brandSlug={brand.slug}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BrandServicesSection;
