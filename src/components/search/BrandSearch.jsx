import { useEffect, useRef, useState } from "react";
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

const BrandSearch = ({ onSelect }) => {
  const dispatch = useDispatch();

  const suggestions = useSelector(selectBrandSuggestions);
  const loading = useSelector(selectBrandSuggestionsLoading);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const selectedQuery = useRef(null);

  const inputClass =
    "h-11 w-full rounded-md border border-[#E5DDD5] bg-gray-50 px-3 pr-10 text-sm text-[#3D3530] shadow-none outline-none transition-colors placeholder:text-[#A69B91] focus-visible:border-[#A68C78] focus-visible:ring-2 focus-visible:ring-[#A68C78]/20 disabled:cursor-not-allowed disabled:bg-[#F8F5F2] disabled:opacity-70";

  useEffect(() => {
    if (!query.trim()) return;

    if (selectedQuery.current === query) {
      selectedQuery.current = null;
      return;
    }

    selectedQuery.current = null;

    const timer = setTimeout(() => {
      setHasSearched(true);
      dispatch(fetchBrandSuggestions(query));
      setOpen(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const handleSelect = (brand) => {
    selectedQuery.current = brand.display_name;

    dispatch(setSelectedBrand(brand));
    dispatch(setBrandFilter(brand.id));

    setQuery(brand.display_name);
    setOpen(false);
    setHasSearched(false);

    // Optional callback for Home page navigation
    onSelect?.(seller);
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    setHasSearched(false);

    dispatch(clearBrandSearch());
  };

  const handleChange = (e) => {
    const value = e.target.value;

    setQuery(value);
    setOpen(Boolean(value.trim()));
    setHasSearched(false);

    if (!value.trim()) {
      dispatch(clearBrandSearch());
    }
  };

  return (
    <div className="relative w-full">
      {/* Label */}
      <label
        htmlFor="brand-search"
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[#7C6C60]"
      >
        Explore Event Brands
      </label>

      {/* Search Input */}
      <div className="relative">
        <input
          id="brand-search"
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          placeholder="Search brand by name..."
          autoComplete="off"
          aria-expanded={open}
          className={inputClass}
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear brand search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-[#8C7B6E] transition hover:bg-[#F0EAE4] hover:text-[#3D3530]"
          >
            Clear
          </button>
        ) : (
          <svg
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A69B91]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        )}
      </div>

      {/* Suggestions */}
      {open &&
        query.trim() &&
        (loading || hasSearched || suggestions.length > 0) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border border-[#E5DDD5] bg-white p-1 shadow-[0_12px_30px_rgba(61,53,48,0.12)]">
            {loading ? (
              <p className="px-3 py-3 text-sm text-[#8C7B6E]">
                Searching brands...
              </p>
            ) : suggestions.length > 0 ? (
              suggestions.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => handleSelect(brand)}
                  className="block w-full rounded-md px-3 py-3 text-left text-sm text-[#3D3530] transition-colors hover:bg-[#F8F5F2] focus:bg-[#F8F5F2] focus:outline-none"
                >
                  <span className="font-medium">{brand.display_name}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-sm text-[#A69B91]">
                No matching brands found.
              </p>
            )}
          </div>
        )}
    </div>
  );
};

export default BrandSearch;
