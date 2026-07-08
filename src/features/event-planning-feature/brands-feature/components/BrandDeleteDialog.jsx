import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  deleteBrand,
  clearDeleteBrandState,
} from "@/store/features/eventPlanner/eventPlannerSlice";

import { selectDeleteBrandState } from "@/store/features/eventPlanner/eventPlannerSelectors";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function BrandDeleteDialog({ brand }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const deleteState = useSelector(selectDeleteBrandState);

  useEffect(() => {
    return () => {
      dispatch(clearDeleteBrandState());
    };
  }, [dispatch]);

  const handleDelete = async () => {
    if (!brand?.slug || deleteState.loading) return;

    const result = await dispatch(deleteBrand(brand.slug));

    if (deleteBrand.fulfilled.match(result)) {
      setOpen(false);

      navigate("/", {
        replace: true,
        state: {
          successMessage:
            result.payload?.message || "Brand deleted successfully.",
        },
      });

      dispatch(clearDeleteBrandState());
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={deleteState.loading}
          className="inline-flex items-center justify-center gap-2  bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          Delete Brand
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Brand</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {brand?.brand_name || "this brand"}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteState.errorMessage && (
          <div className=" border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {deleteState.errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={deleteState.loading}
            onClick={() => setOpen(false)}
            className=" border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleteState.loading || !brand?.slug}
            onClick={handleDelete}
            className="inline-flex items-center justify-center  bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteState.loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
