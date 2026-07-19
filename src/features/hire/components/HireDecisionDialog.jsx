import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  clearHireError,
  selectDecisionHireId,
  selectHireDecisionLoading,
  selectHireError,
  submitHireDecision,
} from "@/store/features/hire/hireSlice";

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
    return error;
  }

  if (error.detail) {
    return error.detail;
  }

  if (error.message) {
    return error.message;
  }

  if (error.non_field_errors?.length) {
    return error.non_field_errors[0];
  }

  return "Unable to update this hire request.";
};

const HireDecisionDialog = ({ hire, decision, trigger, onSuccess }) => {
  const dispatch = useDispatch();

  const decisionLoading = useSelector(selectHireDecisionLoading);
  const decisionHireId = useSelector(selectDecisionHireId);
  const error = useSelector(selectHireError);

  const [open, setOpen] = useState(false);
  const [sellerNote, setSellerNote] = useState("");

  const isAccepting = decision === "accept";
  const isCurrentHireLoading = decisionLoading && decisionHireId === hire?.id;

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSellerNote("");
      dispatch(clearHireError());
    }
  };

  const handleDecision = async (event) => {
    event.preventDefault();

    if (!hire?.id || isCurrentHireLoading) {
      return;
    }

    try {
      const updatedHire = await dispatch(
        submitHireDecision({
          hireId: hire.id,
          decision,
          seller_note: sellerNote.trim(),
        }),
      ).unwrap();

      setOpen(false);
      setSellerNote("");

      onSuccess?.(updatedHire);
    } catch {
      // Redux stores and displays the backend validation error.
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent className="rounded-none border border-gray-300 bg-white shadow-none sm:max-w-md">
        <AlertDialogHeader className="items-start text-left">
          <p
            className={`text-xs font-medium uppercase tracking-[0.2em] ${
              isAccepting ? "text-green-700" : "text-red-600"
            }`}
          >
            {isAccepting ? "Accept Request" : "Reject Request"}
          </p>

          <AlertDialogTitle className="text-2xl font-semibold tracking-tight text-gray-950">
            {isAccepting
              ? "Accept this hire request?"
              : "Reject this hire request?"}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm leading-6 text-gray-600">
            {isAccepting
              ? "The customer will be informed that their booking request has been accepted."
              : "The customer will be informed that you are unable to accept this booking request."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div>
          <label
            htmlFor={`seller-note-${decision}-${hire?.id}`}
            className="mb-2 block text-sm font-medium text-gray-950"
          >
            Seller note
            <span className="ml-1 font-normal text-gray-500">Optional</span>
          </label>

          <textarea
            id={`seller-note-${decision}-${hire?.id}`}
            rows={4}
            value={sellerNote}
            disabled={isCurrentHireLoading}
            placeholder={
              isAccepting
                ? "Your booking request has been accepted."
                : "I am unavailable on the selected date."
            }
            onChange={(event) => {
              setSellerNote(event.target.value);

              if (error) {
                dispatch(clearHireError());
              }
            }}
            className="w-full resize-none rounded-none border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        {error && decisionHireId === hire?.id ? (
          <div className="border-l-2 border-red-600 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCurrentHireLoading}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            type="button"
            disabled={isCurrentHireLoading}
            onClick={handleDecision}
            className={
              isAccepting
                ? "bg-green-700 text-white hover:bg-green-800"
                : "bg-red-600 text-white hover:bg-red-700"
            }
          >
            {isCurrentHireLoading
              ? "Updating..."
              : isAccepting
                ? "Accept Request"
                : "Reject Request"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default HireDecisionDialog;
