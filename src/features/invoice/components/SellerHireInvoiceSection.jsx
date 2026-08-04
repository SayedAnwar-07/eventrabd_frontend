import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Check, Clock3, FileCheck2, X } from "lucide-react";

import CreateInvoiceSection from "./CreateInvoiceSection";
import DownloadInvoiceButton from "./DownloadInvoiceButton";
import EditInvoiceDialog from "./EditInvoiceDialog";
import InvoiceDocument from "./InvoiceDocument";

import {
  fetchInvoices,
  selectInvoiceError,
  selectInvoiceLoading,
  selectInvoices,
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

  return "Unable to load invoice information.";
};

const InvoiceLoadingState = () => {
  return (
    <section className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white">
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

const SellerHireInvoiceSection = ({ hire }) => {
  const dispatch = useDispatch();

  const invoiceDocumentRef = useRef(null);

  const invoices = useSelector(selectInvoices);
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);

  const hireId = hire?.id;

  useEffect(() => {
    if (hireId) {
      dispatch(fetchInvoices());
    }
  }, [dispatch, hireId]);

  const existingInvoice = useMemo(() => {
    if (!hireId || !Array.isArray(invoices)) {
      return null;
    }

    return (
      invoices.find((invoice) => {
        return String(getInvoiceHireId(invoice)) === String(hireId);
      }) || null
    );
  }, [invoices, hireId]);

  const canCreateInvoice =
    hire?.status === "accepted" &&
    hire?.is_accept === true &&
    hire?.can_create_invoice === true;

  if (loading && !existingInvoice) {
    return <InvoiceLoadingState />;
  }

  if (existingInvoice) {
    const customerAgreed = existingInvoice.customer_agreed === true;

    const customerDisagreed = existingInvoice.customer_agreed === false;

    const customerDecisionSubmitted =
      existingInvoice.customer_agreed !== null &&
      existingInvoice.customer_agreed !== undefined;

    const invoiceActions = (
      <div>
        {error ? (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 border-l-2 border-red-600 bg-red-50 px-4 py-3"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

            <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            {customerAgreed ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Check className="h-5 w-5 text-emerald-700" />
                </div>

                <div>
                  <p className="font-semibold text-emerald-700">
                    Customer agreed with this invoice
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    The customer has reviewed and accepted the invoice. The PDF
                    is now available for download.
                  </p>
                </div>
              </div>
            ) : null}

            {customerDisagreed ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <X className="h-5 w-5 text-red-700" />
                </div>

                <div>
                  <p className="font-semibold text-red-700">
                    Customer disagreed with this invoice
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    The customer has rejected the current invoice information.
                  </p>
                </div>
              </div>
            ) : null}

            {!customerDecisionSubmitted ? (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Clock3 className="h-5 w-5 text-amber-700" />
                </div>

                <div>
                  <p className="font-semibold text-gray-950">
                    Waiting for customer decision
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    The customer can review and agree or disagree with this
                    invoice.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            {customerAgreed ? (
              <DownloadInvoiceButton
                targetRef={invoiceDocumentRef}
                invoiceNumber={existingInvoice.invoice_number}
              />
            ) : null}

            {!customerDecisionSubmitted && existingInvoice.can_edit ? (
              <EditInvoiceDialog invoice={existingInvoice} />
            ) : null}

            {!customerAgreed &&
            (!existingInvoice.can_edit || customerDecisionSubmitted) ? (
              <button
                type="button"
                disabled
                className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-6 text-sm font-semibold text-gray-500 opacity-70"
              >
                <FileCheck2 className="h-4 w-4" />
                Editing Disabled
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );

    return (
      <InvoiceDocument
        invoice={existingInvoice}
        hire={hire}
        actions={invoiceActions}
        documentRef={invoiceDocumentRef}
      />
    );
  }

  if (error && !canCreateInvoice) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
      >
        {getErrorMessage(error)}
      </div>
    );
  }

  if (canCreateInvoice) {
    return <CreateInvoiceSection key={hireId} hire={hire} />;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-8 text-center">
      <FileCheck2 className="mx-auto h-8 w-8 text-gray-300" />

      <h3 className="mt-3 font-semibold text-gray-950">Invoice unavailable</h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600">
        This hire is not eligible for invoice creation, or an invoice has not
        been made available yet.
      </p>
    </div>
  );
};

export default SellerHireInvoiceSection;
