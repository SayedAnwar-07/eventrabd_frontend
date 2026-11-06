import { useNavigate } from "react-router-dom";

import SellerSearch from "@/features/event-planning-feature/brand-services-feature/components/search/SellerSearch";
import BrandSearch from "@/features/event-planning-feature/brand-services-feature/components/search/BrandSearch";

import HeroImageCollage from "./HeroImageCollage";
import "./Hero.css";

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
    <section className="eventra-hero relative w-full overflow-hidden">
      <div className="relative mx-auto w-full max-w-425 px-5 sm:px-0">
        {/* =========================================
            DESKTOP HERO
        ========================================= */}

        <div className="desktop-hero relative hidden min-[1100px]:block">
          {/* EDITORIAL BRANDING */}

          <div className="hero-editorial-brand">
            <span className="hero-brand-label">
              EVENT PLANNING & DISCOVERY PLATFORM
            </span>

            <h1 className="hero-editorial-title">
              EVENTRA <span>BD.</span>
            </h1>
          </div>

          {/* TOP LEFT EDITORIAL INTRO */}

          <div className="hero-intro-note">
            <span className="hero-intro-label">THE EVENTRA EXPERIENCE</span>

            <h2 className="hero-intro-heading">
              Great events start with
              <br />
              the right people.
            </h2>

            <p className="hero-intro-description">
              Discover trusted professionals and inspiring brands to bring your
              celebration to life.
            </p>

            <span className="hero-intro-footer">
              DISCOVER · CONNECT · CELEBRATE
            </span>
          </div>

          {/* TOP RIGHT STATUS */}

          <div className="hero-availability">
            <span className="hero-availability-dot" />
            YOUR NEXT EVENT STARTS HERE
          </div>

          {/* CENTER IMAGE COLLAGE */}

          <div className="hero-center-collage">
            <HeroImageCollage />
          </div>

          {/* BOTTOM LEFT EDITORIAL MESSAGE */}

          <div className="hero-bottom-left floating-message">
            <span className="hero-small-label">YOUR EVENT. YOUR STORY.</span>

            <h2 className="hero-bottom-heading">
              Make every
              <br />
              moment <span>matter.</span>
            </h2>

            <p className="hero-bottom-description">
              Discover inspiring brands, trusted event professionals and
              everything you need to create unforgettable celebrations.
            </p>
          </div>

          {/* RIGHT SIDE SEARCH */}

          <div className="hero-search-dock">
            {/* SELLER SEARCH */}

            <div className="hero-search-unit">
              <div className="hero-search-card">
                <SellerSearch onSelect={handleSellerSelect} />
              </div>
            </div>

            {/* BRAND SEARCH */}

            <div className="hero-search-unit">
              <div className="hero-search-card">
                <BrandSearch onSelect={handleBrandSelect} />
              </div>
            </div>
          </div>

          {/* DECORATIVE ELEMENTS */}

          <div className="hero-decoration decoration-one" />

          <div className="hero-decoration decoration-two" />
        </div>

        {/* =========================================
            MOBILE & TABLET HERO
        ========================================= */}

        <div className="mobile-hero min-[1100px]:hidden">
          {/* MOBILE BRANDING */}

          <div className="mobile-brand-block">
            <span className="mobile-brand-label">
              YOUR EVENT DISCOVERY PLATFORM
            </span>

            <h1 className="mobile-brand-title">
              EVENTRA <span>BD.</span>
            </h1>

            <p className="mobile-brand-description">
              Discover trusted event brands, services and experiences for your
              special moments.
            </p>
          </div>

          {/* MOBILE SEARCH */}

          <div className="mobile-search-wrapper">
            <div className="mobile-search-card">
              <SellerSearch onSelect={handleSellerSelect} />
            </div>

            <div className="mobile-search-card">
              <BrandSearch onSelect={handleBrandSelect} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
