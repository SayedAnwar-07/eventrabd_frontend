import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Eye,
  FileWarning,
  ImagePlus,
  Loader2,
} from "lucide-react";

import GlobalErrorMessage from "@/components/common/GlobalErrorMessage";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  clearReportError,
  createReport,
} from "@/store/features/report/reportSlice";

import ReportImagePreview from "./ReportImagePreview";

import {
  canCustomerReport,
  REPORT_MAX_MESSAGE_LENGTH,
} from "../utils/reportUtils";

export default function CreateReportModal({
  hire,
  invoice,
  existingReport = null,
  serviceName = "this service",
  onCreated,
  triggerClassName = "",
}) {
  const dispatch = useDispatch();

  const { creating, createError } = useSelector((state) => state.report);

  const fileInputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [createdReportId, setCreatedReportId] = useState(null);

  const reportId = existingReport?.id || createdReportId;

  const canReport = canCustomerReport({
    hire,
    invoice,
  });

  const previewUrl = useMemo(() => {
    if (!image) {
      return null;
    }

    return URL.createObjectURL(image);
  }, [image]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      dispatch(clearReportError());
    };
  }, [dispatch]);

  const resetForm = () => {
    setMessage("");
    setImage(null);
    setLocalError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    setLocalError(null);

    dispatch(clearReportError());

    if (!nextOpen && !creating) {
      resetForm();
    }
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setLocalError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setLocalError(null);
    setImage(selectedFile);
  };

  const handleRemoveImage = () => {
    setImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (creating) {
      return;
    }

    setLocalError(null);
    dispatch(clearReportError());

    const cleanedMessage = message.trim();

    if (!hire?.id) {
      setLocalError("The related hire could not be found.");
      return;
    }

    if (!cleanedMessage) {
      setLocalError("Please explain the issue you want to report.");
      return;
    }

    if (cleanedMessage.length > REPORT_MAX_MESSAGE_LENGTH) {
      setLocalError(
        `Report message cannot exceed ${REPORT_MAX_MESSAGE_LENGTH} characters.`,
      );
      return;
    }

    try {
      const createdReport = await dispatch(
        createReport({
          hireId: hire.id,
          message: cleanedMessage,
          image,
        }),
      ).unwrap();

      if (createdReport?.id) {
        setCreatedReportId(createdReport.id);
      }

      resetForm();
      setOpen(false);

      onCreated?.(createdReport);
    } catch {
      // Redux stores and displays the backend error.
    }
  };

  if (reportId) {
    return (
      <Button variant="outline" asChild className={triggerClassName}>
        <Link to={`/customer/reports/${reportId}`}>
          <Eye className="mr-2 h-4 w-4" />
          View Report
        </Link>
      </Button>
    );
  }

  if (!canReport) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={`border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive ${triggerClassName}`}
        >
          <FileWarning className="mr-2 h-4 w-4" />
          Report Service
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report Service
          </DialogTitle>

          <DialogDescription>
            Submit a report about {serviceName}. Please describe the issue
            clearly and include supporting evidence if available.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {(localError || createError) && (
            <GlobalErrorMessage error={localError || createError} />
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="report-message">
                Report details
                <span className="ml-1 text-destructive">*</span>
              </Label>

              <span
                className={`text-xs ${
                  message.length >= REPORT_MAX_MESSAGE_LENGTH
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {message.length} / {REPORT_MAX_MESSAGE_LENGTH}
              </span>
            </div>

            <Textarea
              id="report-message"
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value.slice(0, REPORT_MAX_MESSAGE_LENGTH),
                )
              }
              disabled={creating}
              placeholder="Describe what happened, what was agreed, and what went wrong..."
              rows={7}
              maxLength={REPORT_MAX_MESSAGE_LENGTH}
              className="min-h-40 resize-y"
            />

            <p className="text-xs leading-relaxed text-muted-foreground">
              Your report cannot be edited after submission.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-image">
              Supporting image
              <span className="ml-1 font-normal text-muted-foreground">
                (Optional)
              </span>
            </Label>

            {!image ? (
              <label
                htmlFor="report-image"
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-4 py-7 text-center transition-colors hover:bg-muted/40"
              >
                <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />

                <span className="text-sm font-medium">
                  Add supporting image
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  Select an image from your device
                </span>
              </label>
            ) : (
              <ReportImagePreview
                src={previewUrl}
                alt="Selected report attachment"
                onRemove={handleRemoveImage}
              />
            )}

            <Input
              ref={fileInputRef}
              id="report-image"
              type="file"
              accept="image/*"
              disabled={creating}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="rounded-lg border border-amber-200/70 bg-amber-50/70 px-3 py-3 text-xs leading-relaxed text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
            Once submitted, this report becomes read-only. You will still be
            able to view its review status from My Reports.
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={creating}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                creating ||
                !message.trim() ||
                message.trim().length > REPORT_MAX_MESSAGE_LENGTH
              }
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileWarning className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
