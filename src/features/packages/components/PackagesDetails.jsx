import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Package,
  Trash2,
} from "lucide-react";

import {
  clearPackageError,
  deletePackage,
  fetchPackagesByService,
  selectPackageDeleting,
  selectPackageError,
  selectPackagesByService,
  selectPackagesLoading,
} from "@/store/features/packages/packageSlice";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import PackagesCreate from "./PackagesCreate";
import PackagesEdit from "./PackagesEdit";

import {
  formatPackagePrice,
  getPackageLimit,
  supportsPackages,
} from "../utils/packageUtils";

const PackageSkeleton = () => (
  <div className="min-w-full snap-start rounded-md border border-border bg-background p-5 sm:min-w-[calc((100%-1rem)/2)] sm:p-6 lg:min-w-[calc((100%-2rem)/3)]">
    <Skeleton className="h-3 w-20" />

    <Skeleton className="mt-5 h-6 w-4/5" />

    <div className="mt-5 space-y-3">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
    </div>

    <Skeleton className="mt-8 h-9 w-32" />
  </div>
);

const PackagesDetails = ({ service }) => {
  const dispatch = useDispatch();

  const carouselRef = useRef(null);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const serviceId = service?.id;
  const serviceName = service?.service_name;

  const isOwner = service?.brand?.is_owner === true;

  const membershipType =
    service?.membership_type ??
    service?.brand?.membership_type ??
    service?.brand?.seller?.membership_type ??
    "basic";

  const packages = useSelector((state) =>
    selectPackagesByService(state, serviceId),
  );

  const loading = useSelector((state) =>
    selectPackagesLoading(state, serviceId),
  );

  const deleting = useSelector(selectPackageDeleting);
  const error = useSelector(selectPackageError);

  const isSupported = supportsPackages(serviceName);

  const packageLimit = getPackageLimit(membershipType);

  const packageLimitReached =
    packageLimit !== null && packages.length >= packageLimit;

  const serviceDisplayName =
    service?.service_display_name ??
    service?.service_name_display ??
    (serviceName === "videography" ? "Videography" : "Photography");

  useEffect(() => {
    if (!serviceId || !isSupported) {
      return;
    }

    dispatch(fetchPackagesByService(serviceId));
  }, [dispatch, serviceId, isSupported]);

  const updateScrollButtons = () => {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;

    setCanScrollPrev(container.scrollLeft > 2);

    setCanScrollNext(container.scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    updateScrollButtons();

    container.addEventListener("scroll", updateScrollButtons, {
      passive: true,
    });

    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [packages, loading]);

  const scrollCarousel = (direction) => {
    const container = carouselRef.current;

    if (!container) {
      return;
    }

    const card = container.querySelector("[data-package-card]");

    if (!card) {
      return;
    }

    const gap = 16;

    const scrollAmount = card.offsetWidth + gap;

    container.scrollBy({
      left: direction === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  const handleDelete = async (packageId) => {
    try {
      await dispatch(
        deletePackage({
          serviceId,
          packageId,
        }),
      ).unwrap();
    } catch {
      // Backend error already stored in Redux.
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-border pt-10">
      {/* Header */}
      <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {serviceDisplayName} Packages
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                Select the package that best matches your event requirements.
              </p>

              {isOwner && packageLimit !== null && !loading && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {packages.length}/{packageLimit} packages used on{" "}
                  <span className="font-medium capitalize text-foreground">
                    {membershipType}
                  </span>{" "}
                  membership.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {!loading && packages.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!canScrollPrev}
                onClick={() => scrollCarousel("prev")}
                className="h-9 w-9 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />

                <span className="sr-only">Previous packages</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!canScrollNext}
                onClick={() => scrollCarousel("next")}
                className="h-9 w-9 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />

                <span className="sr-only">Next packages</span>
              </Button>
            </div>
          )}

          {isOwner && (
            <PackagesCreate
              serviceId={serviceId}
              disabled={packageLimitReached}
              packageLimit={packageLimit}
            />
          )}
        </div>
      </div>

      {/* Limit Message */}
      {isOwner && packageLimitReached && (
        <div className="mb-6 rounded-md border border-border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">Package limit reached</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Your Basic membership allows a maximum of {packageLimit} packages
            for this service.
          </p>
        </div>
      )}

      {error && <GlobalErrorMessage error={error} className="mb-6" />}

      {/* Loading */}
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          <PackageSkeleton />
          <PackageSkeleton />
          <PackageSkeleton />
        </div>
      ) : packages.length === 0 ? (
        /* Empty */
        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-base font-semibold">
            No packages available
          </h3>

          <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
            {isOwner
              ? "Create your first package so customers can easily choose the right option."
              : "The seller has not added any packages for this service yet."}
          </p>
        </div>
      ) : (
        /* Carousel */
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex touch-auto snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {packages.map((packageItem, index) => {
              const shortInfo = Array.isArray(packageItem.short_info)
                ? packageItem.short_info.filter(Boolean)
                : [];

              return (
                <article
                  key={packageItem.id}
                  data-package-card
                  className="group relative flex min-w-full snap-start flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm transition-all duration-200 sm:min-w-[calc((100%-1rem)/2)] lg:min-w-[calc((100%-2rem)/3)] lg:hover:shadow-md"
                >
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Package {String(index + 1).padStart(2, "0")}
                        </p>

                        <h3 className="mt-3 text-lg font-semibold leading-6 tracking-tight text-foreground">
                          {packageItem.package_title}
                        </h3>
                      </div>

                      {/* Owner Actions */}
                      {isOwner && (
                        <div className="flex shrink-0 gap-1.5">
                          <PackagesEdit
                            serviceId={serviceId}
                            packageItem={packageItem}
                          />

                          <AlertDialog
                            onOpenChange={(open) => {
                              if (open) {
                                dispatch(clearPackageError());
                              }
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={deleting}
                                className="h-9 w-9 rounded-md text-muted-foreground hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />

                                <span className="sr-only">Delete package</span>
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="sm:max-w-md">
                              <AlertDialogHeader>
                                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                                  <Trash2 className="h-5 w-5 text-destructive" />
                                </div>

                                <AlertDialogTitle>
                                  Delete this package?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  You are about to permanently delete{" "}
                                  <span className="font-medium text-foreground">
                                    {packageItem.package_title}
                                  </span>
                                  . This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>
                                  Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                  disabled={deleting}
                                  onClick={() => handleDelete(packageItem.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {deleting ? "Deleting..." : "Delete Package"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mt-6 border-b border-border pb-6">
                      <p className="text-3xl font-bold tracking-tight text-foreground">
                        {formatPackagePrice(packageItem.package_price)}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Package price
                      </p>
                    </div>

                    {/* Short Info */}
                    <div className="flex-1">
                      {shortInfo.length > 0 ? (
                        <ul className="mt-6 space-y-3">
                          {shortInfo.map((info, infoIndex) => (
                            <li
                              key={`${packageItem.id}-${infoIndex}`}
                              className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                            >
                              <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                                <Check className="h-2.5 w-2.5" />
                              </div>

                              <span>{info}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-6 text-sm text-muted-foreground">
                          Package details will be provided by the seller.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Mobile Swipe Hint */}
          {packages.length > 1 && (
            <p className="mt-3 text-center text-xs text-muted-foreground sm:hidden">
              Swipe to view more packages
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default PackagesDetails;
