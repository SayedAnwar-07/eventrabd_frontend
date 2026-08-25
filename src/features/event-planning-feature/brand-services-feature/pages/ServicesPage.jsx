import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import {
  fetchPublicServices,
  setSellerFilter,
  setBrandFilter,
  setServiceTypeFilter,
  setDivisionFilter,
  setSearchFilter,
} from "@/store/features/eventService/eventServiceSlice";

import {
  selectPublicServices,
  selectPublicServicesLoading,
  selectPublicServicesError,
  selectDivisionFilter,
  selectServiceTypeFilter,
  selectSellerFilter,
  selectBrandFilter,
  selectSearchFilter,
} from "@/store/features/eventService/eventServiceSelector";

import PublicServiceCard from "../components/PublicServiceCard";

import SellerSearch from "../components/search/SellerSearch";
import BrandSearch from "../components/search/BrandSearch";

import ServiceFilters from "../components/filters/ServiceFilters";
import MobileFilterSheet from "../components/filters/MobileFilterSheet";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

const ServicesPage = () => {
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  const services = useSelector(selectPublicServices);

  const loading = useSelector(selectPublicServicesLoading);

  const error = useSelector(selectPublicServicesError);

  const division = useSelector(selectDivisionFilter);

  const serviceType = useSelector(selectServiceTypeFilter);

  const sellerId = useSelector(selectSellerFilter);

  const brandId = useSelector(selectBrandFilter);

  const search = useSelector(selectSearchFilter);

  // ===============================
  // Restore filters from URL
  // ===============================

  useEffect(() => {
    const seller = searchParams.get("seller_id");

    const brand = searchParams.get("brand_id");

    const type = searchParams.get("service_type");

    const div = searchParams.get("division");

    const text = searchParams.get("search");

    if (seller) {
      dispatch(setSellerFilter(Number(seller)));
    }

    if (brand) {
      dispatch(setBrandFilter(Number(brand)));
    }

    if (type) {
      dispatch(setServiceTypeFilter(type));
    }

    if (div) {
      dispatch(setDivisionFilter(div));
    }

    if (text) {
      dispatch(setSearchFilter(text));
    }
  }, [dispatch]);

  // ===============================
  // Fetch services + update URL
  // ===============================

  useEffect(() => {
    const params = new URLSearchParams();

    if (sellerId) {
      params.set("seller_id", sellerId);
    }

    if (brandId) {
      params.set("brand_id", brandId);
    }

    if (serviceType) {
      params.set("service_type", serviceType);
    }

    if (division) {
      params.set("division", division);
    }

    if (search) {
      params.set("search", search);
    }

    setSearchParams(params, {
      replace: true,
    });

    dispatch(
      fetchPublicServices({
        page: 1,

        pageSize: 12,

        sellerId,

        brandId,

        serviceType,

        division,

        search,
      }),
    );
  }, [dispatch, sellerId, brandId, serviceType, division, search]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-400">
        {/* Search */}

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <SellerSearch />

          <BrandSearch />
        </section>

        {/* Layout */}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Filters */}

          <aside className="min-w-0 lg:col-span-1">
            <div className="sticky top-24 rounded-lg border p-4">
              <div className="hidden lg:block">
                <ServiceFilters />
              </div>

              <div className="lg:hidden">
                <MobileFilterSheet />
              </div>
            </div>
          </aside>

          {/* Services */}

          <section className="lg:col-span-4">
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
