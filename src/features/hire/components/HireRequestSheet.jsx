import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Clock3, MapPin } from "lucide-react";

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

import {
  fetchPackagesByService,
  selectPackageError,
  selectPackagesByService,
  selectPackagesLoading,
} from "@/store/features/packages/packageSlice";

const PACKAGE_SUPPORTED_SERVICES = ["photography", "videography"];

const HireSellerSheet = ({ service, trigger }) => {
  const dispatch = useDispatch();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [authDialogType, setAuthDialogType] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const [sheetOpen, setSheetOpen] = useState(false);

  const isOwner = service?.brand?.is_owner === true;

  const serviceId = service?.id;

  const supportsPackages = PACKAGE_SUPPORTED_SERVICES.includes(
    service?.service_name,
  );

  const packages = useSelector((state) =>
    serviceId ? selectPackagesByService(state, serviceId) : [],
  );

  const packagesLoading = useSelector((state) =>
    serviceId ? selectPackagesLoading(state, serviceId) : false,
  );

  const packagesError = useSelector(selectPackageError);

  useEffect(() => {
    if (!sheetOpen || !supportsPackages || !serviceId) {
      return;
    }

    dispatch(fetchPackagesByService(serviceId));
  }, [dispatch, sheetOpen, supportsPackages, serviceId]);

  const handleSheetOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setSheetOpen(false);
      return;
    }

    if (!isAuthenticated || !user) {
      setSheetOpen(false);
      setAuthDialogType("login");
      return;
    }

    if (user.role !== "customer") {
      setSheetOpen(false);
      setAuthDialogType("customer-only");
      return;
    }

    setSheetOpen(true);
  };

  const handleLogin = () => {
    setAuthDialogType(null);

    navigate("/login", {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
        },
      },
    });
  };

  const handleHireSuccess = () => {
    setSheetOpen(false);
  };

  if (isOwner) {
    return null;
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetTrigger asChild>
          {trigger || (
            <button
              type="button"
              className="relative w-full rounded-md bg-[#b60018] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#960014]"
            >
              <span className="absolute inset-0 -z-10 animate-ping rounded-md bg-[#b60018]/40" />
              Hire Seller
            </button>
          )}
        </SheetTrigger>

        <SheetContent className="flex w-full flex-col rounded-none border-l overflow-y-auto border-gray-200 bg-white p-0 shadow-none sm:max-w-2xl lg:max-w-4xl [&>button]:rounded-none">
          <div className="mt-8 p-6">
            <HireRequestForm
              key={serviceId}
              serviceId={serviceId}
              serviceName={service?.service_name}
              serviceCharge={service?.shift_charge}
              // Brand Data
              brandLogo={service?.brand?.logo_url}
              brandName={service?.brand?.display_name}
              brandAddress={service?.brand?.office_address}
              rating={
                service?.review_count > 0
                  ? service?.rating_sum / service?.review_count / 2
                  : 0
              }
              ratingCount={service?.review_count || 0}
              packages={packages}
              packagesLoading={packagesLoading}
              packagesError={packagesError}
              onSuccess={handleHireSuccess}
            />
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

      <AlertDialog
        open={Boolean(authDialogType)}
        onOpenChange={(open) => {
          if (!open) {
            setAuthDialogType(null);
          }
        }}
      >
        <AlertDialogContent className="rounded-none border border-gray-300 bg-white shadow-none sm:max-w-md">
          <AlertDialogHeader className="text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
              {authDialogType === "login"
                ? "Authentication Required"
                : "Customer Account Required"}
            </p>

            <AlertDialogTitle className="text-2xl font-semibold tracking-tight text-gray-950">
              {authDialogType === "login"
                ? "Log in to hire this seller"
                : "Only customers can hire sellers"}
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-6 text-gray-600">
              {authDialogType === "login"
                ? "You must log in to your customer account before submitting a hire request."
                : "Seller and admin accounts cannot submit hire requests. Please use a customer account."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-3 sm:space-x-0">
            <AlertDialogCancel className="rounded-none border-gray-300 bg-white px-5 text-gray-950 hover:bg-gray-100">
              Close
            </AlertDialogCancel>

            {authDialogType === "login" && (
              <AlertDialogAction
                type="button"
                onClick={handleLogin}
                className="rounded-none bg-gray-950 px-5 text-white hover:bg-gray-800"
              >
                Log In
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HireSellerSheet;
