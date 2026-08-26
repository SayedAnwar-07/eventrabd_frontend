import { useState } from "react";

import { SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";

import ServiceAreaFilters from "./ServiceAreaFilters";
import ServiceTypeFilters from "./ServiceTypeFilters";

const MobileFilterSheet = () => {
  const [open, setOpen] = useState(false);

  const handleFilterChange = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full gap-2 rounded-md border-gray-200 bg-white px-4 font-medium text-gray-800 shadow-sm transition-all hover:border-[#b60018] hover:bg-red-50 hover:text-[#b60018]"
        >
          <SlidersHorizontal className="size-4" />
          <span>Filters</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[88%] max-w-95 border-l border-gray-200 bg-white p-0"
      >
        <SheetHeader className="border-b border-gray-100 px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <SheetTitle className="text-left text-xl font-bold text-gray-950">
                Filter Services
              </SheetTitle>

              <p className="mt-1 text-left text-sm text-gray-500">
                Find services that match your needs
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="h-[calc(100vh-90px)] overflow-y-auto px-5 py-6">
          <div className="space-y-7">
            <ServiceTypeFilters onFilterChange={handleFilterChange} mobile />

            <div className="h-px bg-gray-100" />

            <ServiceAreaFilters onFilterChange={handleFilterChange} mobile />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSheet;
