const ServiceHero = ({ service, formatServiceName }) => {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        {service.drive_link && (
          <a
            href={service.drive_link}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Check out {service.brand.display_name} portfolio →
          </a>
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        {formatServiceName(service.service_name)}
      </h1>

      <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
        {service.description ||
          "Professional event service designed to create memorable experiences."}
      </p>
    </section>
  );
};

export default ServiceHero;
