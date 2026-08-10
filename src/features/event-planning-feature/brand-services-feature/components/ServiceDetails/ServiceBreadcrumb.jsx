import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const ServiceBreadcrumb = ({ brandSlug, brandName, serviceName }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className="
        mb-6
        flex
        flex-wrap
        items-center
        gap-2
        text-sm
        text-muted-foreground
      "
    >
      <Link
        to="/event-planner/brands"
        className="
          transition
          hover:text-foreground
        "
      >
        Brands
      </Link>

      <ChevronRight
        className="
          h-4
          w-4
        "
      />

      <Link
        to={`/event-planner/brands/${brandSlug}`}
        className="
          transition
          hover:text-foreground
        "
      >
        {brandName || "Brand"}
      </Link>

      <ChevronRight
        className="
          h-4
          w-4
        "
      />

      <span
        className="
          font-medium
          text-foreground
        "
      >
        {serviceName}
      </span>
    </nav>
  );
};

export default ServiceBreadcrumb;
