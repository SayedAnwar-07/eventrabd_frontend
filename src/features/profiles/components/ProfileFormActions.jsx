import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProfileFormActions({ loading, hasChanges, onCancel }) {
  return (
    <div className="border-t pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p
          className={`text-sm ${
            hasChanges ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          {hasChanges ? "Unsaved changes" : "All changes saved"}
        </p>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading || !hasChanges}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
