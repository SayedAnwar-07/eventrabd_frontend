import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "@/store/features/eventPlanner/eventPlannerSlice";
import { Link } from "react-router-dom";
import BrandCard from "@/features/event-planning-feature/brands-feature/components/BrandCard";

const Home = () => {
  const dispatch = useDispatch();

  const { brands, list } = useSelector((state) => state.eventPlanner);

  useEffect(() => {
    console.log("Home fetchBrands called");
    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <section className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          All Event Brands
        </h1>

        {list.loading && <p>Loading brands...</p>}

        {list.errorMessage && (
          <p className="text-red-600">{list.errorMessage}</p>
        )}

        {!list.loading && brands.length === 0 && (
          <p className="text-gray-500">No brands found.</p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
