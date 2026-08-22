import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import ServiceFilters from "./ServiceFilters";

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

        <div className="mt-6 px-4">
          <ServiceFilters />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterSheet;
