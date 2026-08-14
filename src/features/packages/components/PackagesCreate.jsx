import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";

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

const PackagesCreate = ({ serviceId }) => {
  const dispatch = useDispatch();

  const creating = useSelector(selectPackageCreating);
  const error = useSelector(selectPackageError);

  const [open, setOpen] = useState(false);

  const handleOpenChange = (value) => {
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
      // Error is already stored in Redux.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Plus className="size-4" />
          Add Package
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
