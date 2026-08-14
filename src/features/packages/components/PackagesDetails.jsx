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
  <div className="rounded-lg border border-border p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-7 w-28" />
      </div>

      <Skeleton className="h-9 w-20" />
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="size-5" />

            <h2 className="text-xl font-semibold tracking-tight">Packages</h2>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose a package that fits your event requirements.
          </p>
        </div>

        {isOwner && <PackagesCreate serviceId={serviceId} />}
      </div>

      {error && <GlobalErrorMessage error={error} className="mb-5" />}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <PackageSkeleton />
          <PackageSkeleton />
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-5 py-10 text-center">
          <Package className="mx-auto size-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium">No packages available</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {isOwner
              ? "Create your first package for this service."
              : "The seller has not added any packages yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {packages.map((packageItem) => (
            <article
              key={packageItem.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="wrap-break-word text-base font-semibold">
                      {packageItem.package_title}
                    </h3>

                    <p className="mt-3 text-2xl font-bold tracking-tight">
                      {formatPackagePrice(packageItem.package_price)}
                    </p>
                  </div>

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
                          >
                            <Trash2 className="size-4" />

                            <span className="sr-only">Delete package</span>
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete package?</AlertDialogTitle>

                            <AlertDialogDescription>
                              This will permanently delete{" "}
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
                            >
                              {deleting ? "Deleting..." : "Delete Package"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default PackagesDetails;
