import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil } from "lucide-react";

import {
  clearPackageError,
  selectPackageError,
  selectPackageUpdating,
  updatePackage,
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

const PackagesEdit = ({ serviceId, packageItem }) => {
  const dispatch = useDispatch();

  const updating = useSelector(selectPackageUpdating);
  const error = useSelector(selectPackageError);

  const [open, setOpen] = useState(false);

  const handleOpenChange = (value) => {
    setOpen(value);
    dispatch(clearPackageError());
  };

  const handleSubmit = async (packageData) => {
    try {
      await dispatch(
        updatePackage({
          serviceId,
          packageId: packageItem.id,
          packageData,
        }),
      ).unwrap();

      setOpen(false);
    } catch {
      // Error is already stored in Redux.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon">
          <Pencil className="size-4" />

          <span className="sr-only">Edit package</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>

          <DialogDescription>
            Update this package information.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <PackagesForm
            initialValues={{
              package_title: packageItem.package_title,
              package_price: packageItem.package_price,
            }}
            loading={updating}
            error={error}
            submitLabel="Update Package"
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PackagesEdit;
