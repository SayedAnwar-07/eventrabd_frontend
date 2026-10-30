import { useNavigate } from "react-router-dom";

import SellerSearch from "@/features/event-planning-feature/brand-services-feature/components/search/SellerSearch";
import BrandSearch from "@/features/event-planning-feature/brand-services-feature/components/search/BrandSearch";

import ServiceCategoryCarousel from "./ServiceCategoryCarousel";

const Hero = () => {
  const navigate = useNavigate();

  const handleSellerSelect = (seller) => {
    const params = new URLSearchParams();
    params.set("seller_id", seller.id);
    navigate(`/services?${params.toString()}`);
  };

  const handleBrandSelect = (brand) => {
    const params = new URLSearchParams();
    params.set("brand_id", brand.id);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <section className="my-4 w-full overflow-x-clip bg-white md:my-8">
      <div
        className="
          mx-auto grid w-full max-w-[1600px]
          grid-cols-1
          items-center
          gap-10
          px-5 sm:px-8
          lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]
          lg:items-end
          lg:gap-12
          xl:gap-16
        "
      >
        {/* LEFT SIDE - BRAND IDENTITY */}
        <div className="order-1 flex min-w-0 flex-col justify-center lg:col-start-1">
          <h1 className="text-[clamp(4rem,8.5vw,9rem)] font-black uppercase leading-[0.78] tracking-[-0.085em] text-[#171513]">
            <span className="relative inline-block">
              EVENTRA
              <sup className="absolute -right-5 top-1 text-sm font-bold tracking-normal sm:text-lg">
                ™
              </sup>
            </span>
            <br />
            BD
          </h1>

          <div className="mt-10 border-t border-[#E5DDD5] pt-5">
            <p className="max-w-md text-base font-semibold uppercase leading-snug tracking-tight text-[#292522] sm:text-lg">
              Discover trusted event brands, services, and experiences.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - SERVICES + SEARCH */}
        <div className="order-2 flex w-full min-w-0 flex-col gap-6 lg:col-start-2">
          {/* INFINITE SERVICE MARQUEE */}
          <div className="w-full min-w-0">
            <ServiceCategoryCarousel />
          </div>

          {/* SEARCH BOX */}
          <div className="w-full min-w-0 rounded-md border border-[#E5DDD5] p-4 shadow-sm">
            <SellerSearch onSelect={handleSellerSelect} />
            <BrandSearch onSelect={handleBrandSelect} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
