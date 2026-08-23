import ServiceAreaFilters from "./ServiceAreaFilters";
import ServiceTypeFilters from "./ServiceTypeFilters";

const ServiceFilters = () => {
  return (
    <div className="space-y-8">
      <ServiceTypeFilters />

      <ServiceAreaFilters />
    </div>
  );
};

export default ServiceFilters;
