import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Package, Trash2 } from "lucide-react";

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

import { formatPackagePrice, supportsPackages } from "../utils/packageUtils";

const PackageSkeleton = () => (
  <div className="rounded-md border border-border bg-background p-5 sm:p-6">
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-20" />

        <div className="mt-4 space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-2/3" />
        </div>

        <Skeleton className="mt-7 h-8 w-32" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </div>
  </div>
);

const PackagesDetails = ({ service }) => {
  const dispatch = useDispatch();

  const serviceId = service?.id;
  const serviceName = service?.service_name;

  const isOwner = service?.brand?.is_owner === true;

  const packages = useSelector((state) =>
    selectPackagesByService(state, serviceId),
  );

  const loading = useSelector((state) =>
    selectPackagesLoading(state, serviceId),
  );

  const deleting = useSelector(selectPackageDeleting);
  const error = useSelector(selectPackageError);

  const isSupported = supportsPackages(serviceName);

  useEffect(() => {
    if (!serviceId || !isSupported) {
      return;
    }

    dispatch(fetchPackagesByService(serviceId));
  }, [dispatch, serviceId, isSupported]);

  if (!isSupported) {
    return null;
  }

  const handleDelete = async (packageId) => {
    try {
      await dispatch(
        deletePackage({
          serviceId,
          packageId,
        }),
      ).unwrap();
    } catch {
      // Error is already stored in Redux.
    }
  };

  return (
    <section className="mt-12 border-t border-border pt-10">
      {/* Section Header */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
              <Package className="h-5 w-5 text-foreground" />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Photography Packages
              </h2>

              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Select the package that best matches your event requirements.
              </p>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="shrink-0">
            <PackagesCreate serviceId={serviceId} />
          </div>
        )}
      </div>

      {error && <GlobalErrorMessage error={error} className="mb-6" />}

      {/* Loading */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <PackageSkeleton />
          <PackageSkeleton />
          <PackageSkeleton />
          <PackageSkeleton />
        </div>
      ) : packages.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-foreground">
            No packages available
          </h3>

          <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
            {isOwner
              ? "Create your first package so customers can easily choose the right option."
              : "The seller has not added any packages for this service yet."}
          </p>
        </div>
      ) : (
        /* Package Grid */
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((packageItem, index) => (
            <article
              key={packageItem.id}
              className="group relative flex min-h-48 flex-col overflow-hidden rounded-md border border-border bg-background transition-all duration-200"
            >
              {/* Card Top */}
              <div className="flex flex-1 items-start justify-between gap-5 p-5 sm:p-6">
                <div className="min-w-0 flex-1">
                  {/* Package label */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Package {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="h-px flex-1 bg-border" />
                  </div>

                  {/* Title */}
                  <h3 className="max-w-md text-[15px] font-semibold leading-6 text-foreground sm:text-base">
                    {packageItem.package_title}
                  </h3>

                  {/* Price */}
                  <div className="mt-7">
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Package Price
                    </p>

                    <p className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
                      {formatPackagePrice(packageItem.package_price)}
                    </p>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="flex shrink-0 items-center gap-2">
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
                          className="h-9 w-9 rounded-md border-border bg-background text-muted-foreground shadow-none transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
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

                          <AlertDialogDescription className="leading-6">
                            You are about to permanently delete{" "}
                            <span className="font-medium text-foreground">
                              {packageItem.package_title}
                            </span>
                            . This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter className="mt-2">
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

              {/* Bottom accent */}
              <div className="h-1 w-full bg-muted transition-colors group-hover:bg-foreground/10" />
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PackagesDetails;
