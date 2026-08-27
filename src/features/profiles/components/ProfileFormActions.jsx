import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProfileFormActions({ loading, hasChanges, onCancel }) {
  return (
    <div className="border-t border-gray-200 py-5 sm:px-6 ">
      <div className="mb-3">
        <p
          className={`text-xs font-medium ${
            hasChanges ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          {hasChanges ? "You have unsaved changes." : "All changes are saved."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="h-11 w-full rounded-md border-gray-200 bg-gray-100 text-gray-900 shadow-none hover:bg-gray-200"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading || !hasChanges}
          className="h-11 w-full rounded-md bg-[#b60018] text-white shadow-none hover:bg-[#960014] disabled:bg-gray-200 disabled:text-gray-500"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {loading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
