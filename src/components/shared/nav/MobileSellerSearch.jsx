import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LoaderCircle, Search, UserRound, X } from "lucide-react";

import {
  fetchSellerSuggestions,
  setSelectedSeller,
  setSellerFilter,
  clearSellerSearch,
} from "@/store/features/eventService/eventServiceSlice";

import {
  selectSellerSuggestions,
  selectSellerSuggestionsLoading,
} from "@/store/features/eventService/eventServiceSelector";

const MobileSellerSearch = ({ onSelect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const suggestions = useSelector(selectSellerSuggestions);
  const loading = useSelector(selectSellerSuggestionsLoading);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const selectedQuery = useRef(null);

  useEffect(() => {
    const value = query.trim();

    if (!value) return;

    if (selectedQuery.current === query) {
      selectedQuery.current = null;
      return;
    }

    const timer = setTimeout(() => {
      setHasSearched(true);
      dispatch(fetchSellerSuggestions(value));
    }, 400);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const handleSelect = (seller) => {
    selectedQuery.current = seller.full_name;

    dispatch(setSelectedSeller(seller));
    dispatch(setSellerFilter(seller.id));

    setQuery(seller.full_name);
    setOpen(false);
    setHasSearched(false);

    onSelect?.(seller);

    const params = new URLSearchParams();
    params.set("seller_id", seller.id);

    navigate(`/services?${params.toString()}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = query.trim().toLowerCase();
    if (!value) return;

    const matchedSeller = suggestions.find(
      (seller) => seller.full_name?.toLowerCase() === value,
    );

    if (matchedSeller) {
      handleSelect(matchedSeller);
    }
  };

  const handleClear = () => {
    setQuery("");
    setOpen(false);
    setHasSearched(false);
    selectedQuery.current = null;
    dispatch(clearSellerSearch());
  };

  const handleChange = (event) => {
    const value = event.target.value;

    setQuery(value);
    setOpen(Boolean(value.trim()));
    setHasSearched(false);
    selectedQuery.current = null;

    if (!value.trim()) {
      dispatch(clearSellerSearch());
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="mobile-seller-search"
          className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[#7C6C60]"
        >
          Find an Event Professional
        </label>

        <div className="group flex h-12 items-center gap-3 rounded-xl border border-[#E5DDD5] bg-[#FFFCF9] px-3 transition-all duration-300 focus-within:border-[#A68C78] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#A68C78]/10">
          <Search className="h-4.5 w-4.5 shrink-0 text-[#A69B91] transition-colors duration-200 group-focus-within:text-[#9C2135]" />

          <input
            id="mobile-seller-search"
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => query.trim() && setOpen(true)}
            placeholder="Search seller by name..."
            autoComplete="off"
            aria-expanded={open}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#3D3530] outline-none placeholder:text-[#A69B91]"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear seller search"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#9A8A7F] transition-all duration-200 hover:bg-[#F0E8E3] hover:text-[#3D3530] active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {query.trim() && (
          <button
            type="submit"
            className="group mt-3 flex w-full items-center justify-between gap-3 rounded-xl bg-[#3D3530] px-4 py-3 text-left text-white transition-all duration-200 hover:bg-[#51463E] active:scale-[0.98]"
          >
            <span className="min-w-0 truncate text-xs font-medium">
              Search for "{query.trim()}"
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        )}
      </form>

      {open && query.trim() && (
        <div className="mt-3 overflow-hidden rounded-xl border border-[#E5DDD5] bg-white shadow-[0_8px_24px_rgba(61,53,48,0.06)]">
          <div className="border-b border-[#F0EAE4] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8C7B6E]">
              Suggested Professionals
            </p>
          </div>

          <div className="max-h-56 overflow-y-auto p-1.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-5 text-xs text-[#8C7B6E]">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Searching professionals...
              </div>
            ) : hasSearched && suggestions.length > 0 ? (
              suggestions.map((seller) => (
                <button
                  key={seller.id}
                  type="button"
                  onClick={() => handleSelect(seller)}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#F8F5F2] active:scale-[0.99]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F5F2] text-[#756A62] transition-colors group-hover:bg-[#9C2135]/10 group-hover:text-[#9C2135]">
                    <UserRound className="h-4 w-4" />
                  </div>

                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#51463E]">
                    {seller.full_name}
                  </span>

                  <ArrowRight className="h-4 w-4 shrink-0 text-[#A69B91] transition-all group-hover:translate-x-1 group-hover:text-[#9C2135]" />
                </button>
              ))
            ) : hasSearched ? (
              <p className="px-3 py-5 text-center text-xs text-[#A69B91]">
                No matching professionals found.
              </p>
            ) : (
              <p className="px-3 py-4 text-center text-xs text-[#A69B91]">
                Type to find professionals...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileSellerSearch;
