import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import ServiceAreaFilters from "./ServiceAreaFilters";
import ServiceTypeFilters from "./ServiceTypeFilters";

const MobileFilterSheet = () => {
  return (
    <Sheet>
      <SheetTrigger className="border rounded-md px-4 py-2">
        Filter
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Services</SheetTitle>
        </SheetHeader>

        <div className="mt-6 px-4 space-y-8">
          <ServiceTypeFilters />

          <ServiceAreaFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSheet;
