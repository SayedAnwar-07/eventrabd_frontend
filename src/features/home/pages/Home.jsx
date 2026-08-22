import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchBrands } from "@/store/features/eventPlanner/eventPlannerSlice";

import { fetchPublicServices } from "@/store/features/eventService/eventServiceSlice";

import {
  selectPublicServices,
  selectPublicServicesLoading,
  selectPublicServicesError,
} from "@/store/features/eventService/eventServiceSelector";

import BrandCard from "@/features/event-planning-feature/brands-feature/components/BrandCard";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";
import PublicServiceCard from "@/features/event-planning-feature/brand-services-feature/components/PublicServiceCard";
import SellerSearch from "@/features/event-planning-feature/brand-services-feature/components/search/SellerSearch";
import BrandSearch from "@/features/event-planning-feature/brand-services-feature/components/search/BrandSearch";

const Home = () => {
  const dispatch = useDispatch();

  const { brands, list } = useSelector((state) => state.eventPlanner);

  const services = useSelector(selectPublicServices);

  const servicesLoading = useSelector(selectPublicServicesLoading);

  const servicesError = useSelector(selectPublicServicesError);

  useEffect(() => {
    dispatch(fetchBrands());

    dispatch(
      fetchPublicServices({
        page: 1,
        pageSize: 12,
      }),
    );
  }, [dispatch]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-400 space-y-16">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SellerSearch />
          <BrandSearch />
        </section>
        {/* Services */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Explore Event Services
            </h2>

            <p className="mt-2 text-muted-foreground">
              Find event services from trusted brands.
            </p>
          </div>

          {servicesLoading && (
            <p className="text-sm text-muted-foreground">Loading services...</p>
          )}

          {servicesError && <GlobalErrorMessage error={servicesError} />}

          {!servicesLoading && !servicesError && services.length === 0 && (
            <p className="text-sm text-muted-foreground">No services found.</p>
          )}

          {!servicesLoading && services.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <PublicServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </section>

        {/* Brands */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              All Event Brands
            </h2>
          </div>

          {list.loading && (
            <p className="text-sm text-muted-foreground">Loading brands...</p>
          )}

          {list.errorMessage && (
            <GlobalErrorMessage error={list.errorMessage} />
          )}

          {!list.loading && brands.length === 0 && (
            <p className="text-sm text-muted-foreground">No brands found.</p>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Home;
