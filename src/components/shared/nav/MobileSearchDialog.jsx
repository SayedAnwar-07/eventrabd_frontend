import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Sparkles, X } from "lucide-react";

import MobileSellerSearch from "./MobileSellerSearch";
import MobileBrandSearch from "./MobileBrandSearch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MobileSearchDialog({ open, onOpenChange }) {
  const location = useLocation();

  useEffect(() => {
    onOpenChange(false);
    // Close the modal after route navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[12%] w-[calc(100%-24px)] max-w-115 translate-y-0 gap-0 overflow-hidden rounded-2xl border border-[#E5DDD5] bg-white p-0 shadow-[0_24px_80px_rgba(32,24,20,0.18)] duration-300 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4 sm:top-[50%] sm:-translate-y-1/2 dark:border-border dark:bg-background"
      >
        {/* Header */}
        <DialogHeader className="px-5 pb-4 pt-5 text-left dark:border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-1.5 text-[#9C2135]">
                <Sparkles className="h-3.5 w-3.5" />

                <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                  Explore EventraBD
                </span>
              </div>

              <DialogTitle className="text-xl font-bold tracking-tight text-[#302923] dark:text-foreground">
                What are you looking for?
              </DialogTitle>

              <DialogDescription className="mt-1.5 text-xs leading-relaxed text-[#81756C]">
                Discover trusted event services and inspiration.
              </DialogDescription>
            </div>

            <button
              type="button"
              aria-label="Close search"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8F5F2] text-[#81756C] transition-all duration-200 hover:rotate-90 hover:bg-[#F0E8E3] hover:text-[#3D3530] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A68C78] dark:bg-muted dark:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-5 pb-6">
          <MobileSellerSearch onSelect={() => onOpenChange(false)} />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#EEE8E2]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A69B91]">
              Or
            </span>
            <div className="h-px flex-1 bg-[#EEE8E2]" />
          </div>

          <MobileBrandSearch onSelect={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
