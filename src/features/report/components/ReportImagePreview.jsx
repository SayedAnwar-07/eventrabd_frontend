import { useState } from "react";
import { ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function ReportImagePreview({
  src,
  alt = "Report attachment",
  onRemove,
  readOnly = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);

  if (!src) {
    return null;
  }

  return (
    <>
      <div
        className={`group relative w-fit overflow-hidden rounded-md ${className}`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block cursor-zoom-in"
          aria-label="View full image"
        >
          <img
            src={src}
            alt={alt}
            className="h-40 w-40 rounded-md object-cover transition-opacity duration-200 group-hover:opacity-90 sm:h-48 sm:w-48"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
            <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Click to enlarge
            </span>
          </div>
        </button>

        {!readOnly && onRemove && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={onRemove}
            className="absolute right-2 top-2 h-7 w-7 rounded-full shadow-sm"
            aria-label="Remove selected image"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}

        <div className="flex items-center gap-1.5 rounded-b-md bg-background/90 px-2.5 py-1.5 text-[11px] text-muted-foreground">
          <ImageIcon className="h-3 w-3" />
          Report attachment
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{alt}</DialogTitle>

          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] w-full rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
