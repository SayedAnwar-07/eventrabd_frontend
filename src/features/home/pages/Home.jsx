import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "@/store/features/eventPlanner/eventPlannerSlice";
import { Link } from "react-router-dom";

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
            <div
              key={brand.id}
              className="rounded-3xl border bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-gray-900">
                {brand.brand_name}
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {brand.short_description}
              </p>

              <p className="mt-4 text-sm text-gray-700">
                📍 {brand.service_area}
              </p>

              <p className="mt-2 text-sm text-gray-700">
                🧾 {brand.total_services} Services
              </p>

              <Link
                to={`/event-planner/brands/${brand.slug}`}
                className="mt-5 inline-block w-full rounded-xl bg-black px-4 py-2 text-center text-sm font-semibold text-white"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
