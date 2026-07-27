import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  acceptHire,
  clearHireOperationError,
  rejectHire,
  selectDecisionHireId,
  selectHireDecisionError,
  selectHireDecisionLoading,
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

const HireDecisionDialog = ({ hire, decision, trigger, onSuccess }) => {
  const dispatch = useDispatch();

  const decisionLoading = useSelector(selectHireDecisionLoading);

  const decisionHireId = useSelector(selectDecisionHireId);

  const reduxError = useSelector(selectHireDecisionError);

  const [open, setOpen] = useState(false);
  const [sellerNote, setSellerNote] = useState("");
  const [localError, setLocalError] = useState(null);

  const isAccepting = decision === "accept";

  const isCurrentHireLoading = decisionLoading && decisionHireId === hire?.id;

  const displayedError = localError || reduxError;

  const clearDecisionError = () => {
    setLocalError(null);
    dispatch(clearHireOperationError("decision"));
  };

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);

    if (nextOpen) {
      clearDecisionError();
      return;
    }

    setSellerNote("");
    clearDecisionError();
  };

  const handleDecision = async (event) => {
    event.preventDefault();

    if (!hire?.id || isCurrentHireLoading) {
      return;
    }

    clearDecisionError();

    const payload = {
      hireId: hire.id,
      seller_note: sellerNote.trim(),
    };

    try {
      const updatedHire = isAccepting
        ? await dispatch(acceptHire(payload)).unwrap()
        : await dispatch(rejectHire(payload)).unwrap();

      setOpen(false);
      setSellerNote("");
      setLocalError(null);

      onSuccess?.(updatedHire);
    } catch (error) {
      /*
       * Redux already contains the error, but keeping it locally
       * ensures this exact dialog displays the rejected request.
       */
      setLocalError(
        error || {
          message: isAccepting
            ? "Unable to accept the hire request."
            : "Unable to reject the hire request.",
        },
      );
    }
  };

  const handleNoteChange = (event) => {
    setSellerNote(event.target.value);

    if (displayedError) {
      clearDecisionError();
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
              ? "The customer will be informed that their " +
                "booking request has been accepted."
              : "The customer will be informed that you are " +
                "unable to accept this booking request."}
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
            maxLength={1000}
            value={sellerNote}
            disabled={isCurrentHireLoading}
            placeholder={
              isAccepting
                ? "Your booking request has been accepted."
                : "I am unavailable on the selected date."
            }
            onChange={handleNoteChange}
            className="w-full resize-none rounded-none border border-gray-300 bg-white px-3 py-3 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          <p className="mt-1 text-right text-xs text-gray-500">
            {sellerNote.length}/1000
          </p>
        </div>

        {displayedError?.message ? (
          <div
            role="alert"
            className="border-l-2 border-red-600 bg-red-50 px-4 py-3"
          >
            <p className="text-sm text-red-700">{displayedError.message}</p>
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
                ? "bg-green-700 text-white " + "hover:bg-green-800"
                : "bg-red-600 text-white " + "hover:bg-red-700"
            }
          >
            {isCurrentHireLoading
              ? isAccepting
                ? "Accepting..."
                : "Rejecting..."
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
