"use client";

import { useState } from "react";
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

  if (typeof error === "string") return error;

  if (error.detail) return error.detail;

  if (Array.isArray(error)) {
    return error.join(", ");
  }

  if (typeof error === "object") {
    return Object.entries(error)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: ${value.join(", ")}`;
        }

        if (typeof value === "object" && value !== null) {
          return `${key}: ${JSON.stringify(value)}`;
        }

        return `${key}: ${value}`;
      })
      .join(" | ");
  }

  return "Something went wrong.";
};

const ServiceDelete = ({
  brandSlug,
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

  const handleDelete = async (e) => {
    e.preventDefault();

    setLocalError("");

    if (!brandSlug || !serviceName) {
      setLocalError("Brand slug or service name is missing.");
      return;
    }

    try {
      const result = await dispatch(
        deleteEventService({
          brandSlug,
          serviceName,
        }),
      ).unwrap();

      dispatch(clearOperationState());
      setOpen(false);
      onSuccess?.(result);
    } catch (error) {
      console.error("EVENT SERVICE DELETE ERROR:", error);
      setLocalError(getErrorMessage(error));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <button
            type="button"
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Delete Service
          </button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete service?</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">{serviceTitle}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {visibleError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {visibleError}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Service"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ServiceDelete;
