import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchPublicServices } from "@/store/features/eventService/eventServiceSlice";

import {
  selectPublicServices,
  selectPublicServicesLoading,
  selectPublicServicesError,
  selectDivisionFilter,
} from "@/store/features/eventService/eventServiceSelector";

import PublicServiceCard from "../components/PublicServiceCard";

import SellerSearch from "../components/search/SellerSearch";
import BrandSearch from "../components/search/BrandSearch";

import ServiceFilters from "../components/filters/ServiceFilters";
import MobileFilterSheet from "../components/filters/MobileFilterSheet";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

const ServicesPage = () => {
  const dispatch = useDispatch();

  const services = useSelector(selectPublicServices);

  const loading = useSelector(selectPublicServicesLoading);

  const error = useSelector(selectPublicServicesError);

  const division = useSelector(selectDivisionFilter);

  useEffect(() => {
    dispatch(
      fetchPublicServices({
        page: 1,
        pageSize: 12,
        division: division || "",
      }),
    );
  }, [dispatch, division]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-400">
        {/* Search */}

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <SellerSearch />

          <BrandSearch />
        </section>

        {/* Main Layout */}

        <div className="grid gap-8 lg:grid-cols-6">
          {/* Left Filters */}

          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-lg border p-4">
              <div className="hidden lg:block">
                <ServiceFilters />
              </div>

              <div className="lg:hidden">
                <MobileFilterSheet />
              </div>
            </div>
          </aside>

          {/* Right Services */}

          <section className="lg:col-span-5">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Explore Event Services</h1>

              <p className="mt-2 text-muted-foreground">
                Find event services from trusted brands.
              </p>
            </div>

            {loading && (
              <p className="text-sm text-muted-foreground">
                Loading services...
              </p>
            )}

            {error && <GlobalErrorMessage error={error} />}

            {!loading && !error && services.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No services found.
              </p>
            )}

            {!loading && services.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <PublicServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ServicesPage;
