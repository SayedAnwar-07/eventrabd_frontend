import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchSellerSuggestions,
  fetchPublicServices,
  setSelectedSeller,
  clearSellerSearch,
} from "@/store/features/eventService/eventServiceSlice";

import {
  selectSellerSuggestions,
  selectSellerSuggestionsLoading,
} from "@/store/features/eventService/eventServiceSelector";

const SellerSearch = () => {
  const dispatch = useDispatch();

  const suggestions = useSelector(selectSellerSuggestions);

  const loading = useSelector(selectSellerSuggestionsLoading);

  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);

  // debounce

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(fetchSellerSuggestions(query));

      setOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const handleSelect = (seller) => {
    dispatch(setSelectedSeller(seller));

    dispatch(
      fetchPublicServices({
        page: 1,
        seller_id: seller.id,
      }),
    );

    setQuery(seller.full_name);

    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");

    dispatch(clearSellerSearch());

    dispatch(
      fetchPublicServices({
        page: 1,
      }),
    );
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search seller..."
          className="
            h-10 w-full rounded-md border
            bg-background px-3 text-sm
            outline-none
          "
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="
              rounded-md border px-3 text-sm
            "
          >
            Clear
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div
          className="
            absolute z-50 mt-2 w-full
            rounded-md border bg-background
            shadow-md
          "
        >
          {loading && (
            <p className="p-3 text-sm text-muted-foreground">Searching...</p>
          )}

          {suggestions.map((seller) => (
            <button
              key={seller.id}
              type="button"
              onClick={() => handleSelect(seller)}
              className="
                block w-full px-3 py-2
                text-left text-sm
                hover:bg-muted
              "
            >
              {seller.full_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerSearch;
