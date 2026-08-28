import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LockKeyhole, Plus } from "lucide-react";

import {
  clearPackageError,
  createPackage,
  selectPackageCreating,
  selectPackageError,
} from "@/store/features/packages/packageSlice";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import PackagesForm from "./PackagesForm";

const PackagesCreate = ({
  serviceId,
  disabled = false,
  packageLimit = null,
}) => {
  const dispatch = useDispatch();

  const creating = useSelector(selectPackageCreating);

  const error = useSelector(selectPackageError);

  const [open, setOpen] = useState(false);

  const handleOpenChange = (value) => {
    if (value && disabled) {
      return;
    }

    setOpen(value);

    dispatch(clearPackageError());
  };

  const handleSubmit = async (packageData) => {
    try {
      await dispatch(
        createPackage({
          serviceId,
          packageData,
        }),
      ).unwrap();

      setOpen(false);
    } catch {
      // Backend error stays visible
      // inside PackagesForm.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          disabled={disabled}
          title={
            disabled
              ? `Basic membership allows maximum ${packageLimit} packages.`
              : undefined
          }
        >
          {disabled ? (
            <LockKeyhole className="size-4" />
          ) : (
            <Plus className="size-4" />
          )}

          {disabled ? "Package Limit Reached" : "Add Package"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Package</DialogTitle>

          <DialogDescription>
            Add a new package for this service.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <PackagesForm
            loading={creating}
            error={error}
            submitLabel="Create Package"
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PackagesCreate;
