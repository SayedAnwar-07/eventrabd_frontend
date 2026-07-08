"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteEventService,
  clearOperationState,
} from "@/store/features/eventService/eventServiceSlice";

import {
  selectOperationLoading,
  selectOperationError,
} from "@/store/features/eventService/eventServiceSelector";

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

const getErrorMessage = (error) => {
  if (!error) return "";

  if (typeof error === "string") {
    if (error.includes("<!DOCTYPE") || error.includes("<html")) {
      return "Server error. Check backend console.";
    }

    return error
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (Array.isArray(error)) {
    return error.join(" ");
  }

  if (typeof error === "object") {
    if (error.detail) return getErrorMessage(error.detail);
    if (error.message) return getErrorMessage(error.message);
    if (error.error) return getErrorMessage(error.error);

    const firstError = Object.values(error)[0];

    if (Array.isArray(firstError)) {
      return firstError.join(" ");
    }

    if (typeof firstError === "string") {
      return firstError;
    }

    return "Something went wrong.";
  }

  return "Something went wrong.";
};

const ServiceDelete = ({
  brandSlug,
  serviceId,
  serviceName,
  serviceTitle = "this service",
  trigger,
  onSuccess,
}) => {
  const dispatch = useDispatch();

  const loading = useSelector(selectOperationLoading);
  const reduxError = useSelector(selectOperationError);

  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState("");

  const visibleError = localError || getErrorMessage(reduxError);

  const handleOpenChange = (value) => {
    setOpen(value);

    if (value) {
      setLocalError("");
      dispatch(clearOperationState());
    }
  };

  const handleDelete = async (event) => {
    event.preventDefault();

    setLocalError("");
    dispatch(clearOperationState());

    if (!brandSlug || !serviceId || !serviceName) {
      setLocalError("Service delete information is missing.");
      return;
    }

    try {
      const result = await dispatch(
        deleteEventService({
          brandSlug,
          serviceId,
          serviceName,
        }),
      ).unwrap();

      dispatch(clearOperationState());
      setOpen(false);
      onSuccess?.(result);
    } catch (error) {
      setLocalError(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <button
            type="button"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Delete Service
          </button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Service</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {serviceTitle || "this service"}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {visibleError && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {visibleError}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => setOpen(false)}
            className="border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="inline-flex items-center justify-center bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ServiceDelete;
