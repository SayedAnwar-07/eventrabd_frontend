import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchBrandSuggestions,
  setSelectedBrand,
  setBrandFilter,
  clearBrandSearch,
} from "@/store/features/eventService/eventServiceSlice";

import {
  selectBrandSuggestions,
  selectBrandSuggestionsLoading,
} from "@/store/features/eventService/eventServiceSelector";

const BrandSearch = () => {
  const dispatch = useDispatch();

  const suggestions = useSelector(selectBrandSuggestions);

  const loading = useSelector(selectBrandSuggestionsLoading);

  const [query, setQuery] = useState("");

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch(fetchBrandSuggestions(query));

      setOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const handleSelect = (brand) => {
    dispatch(setSelectedBrand(brand));

    dispatch(setBrandFilter(brand.id));

    setQuery(brand.display_name);

    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");

    dispatch(clearBrandSearch());
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search brand..."
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

          {suggestions.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => handleSelect(brand)}
              className="
block w-full px-3 py-2
text-left text-sm
hover:bg-muted
"
            >
              {brand.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandSearch;
