import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrands } from "@/store/features/eventPlanner/eventPlannerSlice";
import BrandCard from "@/features/event-planning-feature/brands-feature/components/BrandCard";
import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

const Home = () => {
  const dispatch = useDispatch();

  const { brands, list } = useSelector((state) => state.eventPlanner);

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  return (
    <section className="min-h-screen">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">All Event Brands</h1>

        {list.loading && <p>Loading brands...</p>}

        {list.errorMessage && <GlobalErrorMessage error={list.errorMessage} />}

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
