import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, X } from "lucide-react";

import DownloadInvoiceButton from "./DownloadInvoiceButton";
import InvoiceDocument from "./InvoiceDocument";

import {
  clearInvoiceError,
  clearInvoiceSuccessMessage,
  fetchInvoices,
  selectInvoiceDecisionLoading,
  selectInvoiceError,
  selectInvoiceLoading,
  selectInvoiceSuccessMessage,
  selectInvoices,
  submitInvoiceDecision,
} from "@/store/features/invoice/invoiceSlice";

const getInvoiceHireId = (invoice) => {
  if (!invoice) {
    return null;
  }

  if (invoice.hire && typeof invoice.hire === "object") {
    return invoice.hire.id ?? null;
  }

  return invoice.hire ?? invoice.hire_id ?? null;
};

const getErrorMessage = (error) => {
  if (!error) {
    return "";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error?.detail === "string") {
    return error.detail;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return "Unable to process the invoice request.";
};

const InvoiceLoadingState = () => {
  return (
    <section className="mt-5 animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="px-6 py-10 sm:px-10">
        <div className="mx-auto h-8 w-44 rounded bg-gray-200" />

        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div className="space-y-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-4/5 rounded bg-gray-100" />
          </div>

          <div className="space-y-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-4/5 rounded bg-gray-100" />
          </div>

          <div className="space-y-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-4/5 rounded bg-gray-100" />
          </div>
        </div>

        <div className="mt-10 h-40 rounded bg-gray-100" />

        <div className="ml-auto mt-10 h-48 max-w-sm rounded bg-gray-100" />
      </div>
    </section>
  );
};

const CustomerInvoiceDetails = ({ hire }) => {
  const dispatch = useDispatch();

  const invoiceDocumentRef = useRef(null);

  const invoices = useSelector(selectInvoices);
  const loading = useSelector(selectInvoiceLoading);
  const decisionLoading = useSelector(selectInvoiceDecisionLoading);
  const error = useSelector(selectInvoiceError);
  const successMessage = useSelector(selectInvoiceSuccessMessage);

  const [submittingDecision, setSubmittingDecision] = useState(null);

  const hireId = hire?.id;

  useEffect(() => {
    dispatch(clearInvoiceError());
    dispatch(clearInvoiceSuccessMessage());

    if (hireId) {
      dispatch(fetchInvoices());
    }

    return () => {
      dispatch(clearInvoiceError());
      dispatch(clearInvoiceSuccessMessage());
    };
  }, [dispatch, hireId]);

  const invoice = useMemo(() => {
    if (!hireId || !Array.isArray(invoices)) {
      return null;
    }

    return (
      invoices.find((item) => {
        return String(getInvoiceHireId(item)) === String(hireId);
      }) || null
    );
  }, [invoices, hireId]);

  const handleDecision = async (customerAgreed) => {
    if (
      !invoice?.id ||
      decisionLoading ||
      typeof customerAgreed !== "boolean"
    ) {
      return;
    }

    setSubmittingDecision(customerAgreed);

    dispatch(clearInvoiceError());
    dispatch(clearInvoiceSuccessMessage());

    try {
      await dispatch(
        submitInvoiceDecision({
          invoiceId: invoice.id,
          customerAgreed,
        }),
      ).unwrap();
    } finally {
      setSubmittingDecision(null);
    }
  };

  if (loading && !invoice) {
    return <InvoiceLoadingState />;
  }

  if (!invoice) {
    if (error) {
      return (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {getErrorMessage(error)}
        </div>
      );
    }

    return null;
  }

  const canCustomerDecide =
    invoice.can_customer_decide === true && invoice.customer_agreed === null;

  const decisionSubmitted =
    invoice.customer_agreed !== null && invoice.customer_agreed !== undefined;

  const invoiceActions = (
    <div>
      {error ? (
        <div
          role="alert"
          className="mb-5 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {getErrorMessage(error)}
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="mb-5 border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {successMessage}
        </div>
      ) : null}

      {canCustomerDecide ? (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold text-gray-950">
              Review and confirm this invoice
            </h3>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
              Check the event details, service price, discount, advance payment
              and due amount before submitting your final decision.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => handleDecision(true)}
              disabled={decisionLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#b60018] px-6 text-sm font-semibold text-white transition hover:bg-[#960014] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="h-4 w-4" />

              {decisionLoading && submittingDecision === true
                ? "Submitting..."
                : "I Agree"}
            </button>

            <button
              type="button"
              onClick={() => handleDecision(false)}
              disabled={decisionLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-800 transition hover:border-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />

              {decisionLoading && submittingDecision === false
                ? "Submitting..."
                : "I Disagree"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          {invoice.customer_agreed === true ? (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-5 w-5 text-emerald-700" />
                </div>

                <div>
                  <p className="font-semibold text-emerald-700">
                    Invoice agreed
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    You have agreed with this invoice. The PDF is now available
                    for download.
                  </p>
                </div>
              </div>

              <DownloadInvoiceButton
                targetRef={invoiceDocumentRef}
                invoiceNumber={invoice.invoice_number}
              />
            </div>
          ) : null}

          {invoice.customer_agreed === false ? (
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                <X className="h-5 w-5 text-red-700" />
              </div>

              <div>
                <p className="font-semibold text-red-700">Invoice disagreed</p>

                <p className="mt-1 text-sm text-gray-600">
                  You have disagreed with this invoice.
                </p>
              </div>
            </div>
          ) : null}

          {!decisionSubmitted ? (
            <div>
              <p className="font-semibold text-gray-950">
                Invoice decision unavailable
              </p>

              <p className="mt-1 text-sm text-gray-600">
                You cannot submit a decision for this invoice.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-w-0">
      <InvoiceDocument
        invoice={invoice}
        hire={hire}
        actions={invoiceActions}
        documentRef={invoiceDocumentRef}
      />
    </div>
  );
};

export default CustomerInvoiceDetails;
