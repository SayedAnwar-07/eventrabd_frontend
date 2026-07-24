import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import HireRequestForm from "./HireRequestForm";

const formatServiceName = (name = "") => {
  return name
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const HireSellerSheet = ({ service }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const isOwner = service?.brand?.is_owner === true;

  const handleSheetOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setSheetOpen(false);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setLoginDialogOpen(true);
      return;
    }

    setSheetOpen(true);
  };

  const handleLogin = () => {
    setLoginDialogOpen(false);

    navigate("/login", {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  // A seller should not see a hire button on their own service.
  if (isOwner) {
    return null;
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="w-full border border-white bg-white px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-200"
          >
            Hire Seller
          </button>
        </SheetTrigger>

        <SheetContent className="w-full rounded-none border-l border-gray-200 bg-white p-0 shadow-none sm:max-w-xl [&>button]:rounded-none">
          <SheetHeader className="border-b border-gray-200 px-6 py-6 text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Booking Request
            </p>

            <SheetTitle className="text-2xl font-semibold tracking-tight text-gray-950">
              Hire Seller
            </SheetTitle>

            <SheetDescription className="text-sm leading-6 text-gray-600">
              Submit your event dates and venue information for this service.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="border-l-2 border-gray-950 pl-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Selected Service
              </p>

              <p className="mt-1 text-base font-semibold text-gray-950">
                {formatServiceName(service?.service_name)}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                {service?.brand?.brand_name || "Unknown brand"}
              </p>

              <p className="mt-2 text-sm font-medium text-gray-950">
                ৳{service?.shift_charge} per shift
              </p>
            </div>

            <div className="mt-8">
              <HireRequestForm serviceId={service?.id} />
            </div>
          </div>

          <SheetFooter className="border-t border-gray-200 px-6 py-4">
            <SheetClose asChild>
              <button
                type="button"
                className="border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
              >
                Cancel
              </button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <AlertDialogContent className="rounded-none border border-gray-300 bg-white shadow-none sm:max-w-md">
          <AlertDialogHeader className="text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              Authentication Required
            </p>

            <AlertDialogTitle className="text-2xl font-semibold tracking-tight text-gray-950">
              Log in to hire this seller
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6 text-gray-600">
              You must log in to your customer account before submitting a hire
              request.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-3 sm:space-x-0">
            <AlertDialogCancel className="rounded-none border-gray-300 bg-white px-5 text-gray-950 hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              type="button"
              onClick={handleLogin}
              className="rounded-none bg-gray-950 px-5 text-white hover:bg-gray-800"
            >
              Log In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HireSellerSheet;
