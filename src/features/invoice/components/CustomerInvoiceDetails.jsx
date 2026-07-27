import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  FileText,
  UserRound,
  X,
} from "lucide-react";

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

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return "৳0.00";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `৳${value}`;
  }

  return `৳${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatLabel = (value) => {
  if (!value) {
    return "Not available";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => {
      return character.toUpperCase();
    });
};

const getPaymentStatusStyle = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "paid":
      return "border-emerald-300 bg-emerald-50 text-emerald-700";

    case "partially_paid":
    case "partial":
      return "border-amber-300 bg-amber-50 text-amber-700";

    case "overdue":
      return "border-red-300 bg-red-50 text-red-700";

    default:
      return "border-gray-300 bg-gray-50 text-gray-700";
  }
};

const InvoiceLoadingState = () => {
  return (
    <section className="mt-5 animate-pulse border border-gray-200 bg-white">
      <div className="bg-gray-950 px-5 py-6 sm:px-7">
        <div className="h-3 w-24 bg-gray-700" />
        <div className="mt-3 h-8 w-52 bg-gray-700" />
      </div>

      <div className="grid gap-8 p-5 sm:grid-cols-2 sm:p-7">
        <div className="space-y-3">
          <div className="h-3 w-20 bg-gray-200" />
          <div className="h-5 w-40 bg-gray-200" />
          <div className="h-3 w-52 bg-gray-100" />
        </div>

        <div className="space-y-3">
          <div className="h-3 w-20 bg-gray-200" />
          <div className="h-5 w-40 bg-gray-200" />
          <div className="h-3 w-52 bg-gray-100" />
        </div>
      </div>

      <div className="border-t border-gray-200 p-5 sm:p-7">
        <div className="h-36 bg-gray-100" />
      </div>
    </section>
  );
};

const InvoiceInfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-medium text-gray-950">
        {value || "Not available"}
      </p>
    </div>
  );
};

const SummaryRow = ({ label, value, strong = false }) => {
  return (
    <div
      className={`flex items-center justify-between gap-5 py-2.5 ${
        strong
          ? "border-t border-gray-950 text-base"
          : "border-b border-gray-100 text-sm"
      }`}
    >
      <span
        className={strong ? "font-semibold text-gray-950" : "text-gray-600"}
      >
        {label}
      </span>

      <span
        className={
          strong ? "font-bold text-gray-950" : "font-medium text-gray-950"
        }
      >
        {value}
      </span>
    </div>
  );
};

const CustomerInvoiceDetails = ({ hireId }) => {
  const dispatch = useDispatch();

  const invoices = useSelector(selectInvoices);
  const loading = useSelector(selectInvoiceLoading);
  const decisionLoading = useSelector(selectInvoiceDecisionLoading);
  const error = useSelector(selectInvoiceError);
  const successMessage = useSelector(selectInvoiceSuccessMessage);

  const [submittingDecision, setSubmittingDecision] = useState(null);

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
        const invoiceHireId = item?.hire?.id ?? item?.hire_id ?? item?.hire;

        return String(invoiceHireId) === String(hireId);
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
    return null;
  }

  const canCustomerDecide =
    invoice.can_customer_decide === true && invoice.customer_agreed === null;

  const decisionSubmitted =
    invoice.customer_agreed !== null && invoice.customer_agreed !== undefined;

  const serviceName = invoice?.service?.service_name || "Event service";

  const brandName = invoice?.brand?.brand_name || "Service provider";

  const sellerName = invoice?.seller?.full_name || "Not available";

  const customerName = invoice?.customer?.full_name || "Not available";

  return (
    <section className="mt-5 border border-gray-200 bg-white">
      {/* Invoice Header */}

      <header className="bg-gray-950 px-5 py-6 text-white sm:px-7 sm:py-7">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-gray-300">
              <FileText className="h-4 w-4" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Official Invoice
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              Invoice
            </h2>

            <p className="mt-2 break-all text-sm text-gray-300">
              {invoice.invoice_number}
            </p>
          </div>

          <div className="sm:text-right">
            <span
              className={`inline-flex border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getPaymentStatusStyle(
                invoice.payment_status,
              )}`}
            >
              {formatLabel(invoice.payment_status)}
            </span>

            <div className="mt-4 space-y-1 text-sm">
              <p className="text-gray-400">Total Amount</p>

              <p className="text-2xl font-semibold text-white">
                {formatMoney(invoice.total)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Invoice Dates */}

      <div className="grid border-b border-gray-200 bg-gray-50 sm:grid-cols-3">
        <div className="border-b border-gray-200 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

            <InvoiceInfoItem
              label="Issue Date"
              value={formatDate(invoice.issue_date)}
            />
          </div>
        </div>

        <div className="border-b border-gray-200 px-5 py-4 sm:border-b-0 sm:border-r sm:px-7">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

            <InvoiceInfoItem
              label="Payment Due"
              value={formatDate(invoice.due_payment_last_date)}
            />
          </div>
        </div>

        <div className="px-5 py-4 sm:px-7">
          <InvoiceInfoItem
            label="Hire Reference"
            value={`#${invoice?.hire?.id || hireId}`}
          />
        </div>
      </div>

      {/* Seller and Customer */}

      <div className="grid gap-8 border-b border-gray-200 p-5 sm:grid-cols-2 sm:p-7">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Invoice From
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-950">
              {brandName}
            </h3>

            <p className="mt-1 text-sm text-gray-700">{sellerName}</p>

            {invoice?.seller?.contact_number ? (
              <a
                href={`tel:${invoice.seller.contact_number}`}
                className="mt-2 block text-sm text-gray-500 hover:text-gray-950 hover:underline"
              >
                {invoice.seller.contact_number}
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-gray-400" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
              Bill To
            </p>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-950">
              {customerName}
            </h3>

            {invoice?.customer?.email ? (
              <a
                href={`mailto:${invoice.customer.email}`}
                className="mt-1 block break-all text-sm text-gray-700 hover:text-gray-950 hover:underline"
              >
                {invoice.customer.email}
              </a>
            ) : null}

            {invoice?.customer?.contact_number ? (
              <a
                href={`tel:${invoice.customer.contact_number}`}
                className="mt-2 block text-sm text-gray-500 hover:text-gray-950 hover:underline"
              >
                {invoice.customer.contact_number}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Invoice Line Item */}

      <div className="border-b border-gray-200">
        <div className="border-b border-gray-200 px-5 py-4 sm:px-7">
          <h3 className="font-semibold text-gray-950">Invoice Details</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-162.5 border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 sm:px-7">
                  Description
                </th>

                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Quantity
                </th>

                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Rate
                </th>

                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 sm:px-7">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="px-5 py-5 align-top sm:px-7">
                  <p className="font-semibold text-gray-950">
                    {formatLabel(serviceName)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Service provided by {brandName}
                  </p>
                </td>

                <td className="px-4 py-5 text-center align-top text-sm text-gray-700">
                  1
                </td>

                <td className="px-4 py-5 text-right align-top text-sm text-gray-700">
                  {formatMoney(invoice.service_price)}
                </td>

                <td className="px-5 py-5 text-right align-top text-sm font-semibold text-gray-950 sm:px-7">
                  {formatMoney(invoice.service_price)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes and Totals */}

      <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
            Seller Note
          </p>

          <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-700">
            {invoice.seller_note ||
              "No additional note was provided by the seller."}
          </p>
        </div>

        <div>
          <SummaryRow
            label="Service Price"
            value={formatMoney(invoice.service_price)}
          />

          <SummaryRow
            label="Discount"
            value={`- ${formatMoney(invoice.discount_price)}`}
          />

          <SummaryRow label="Subtotal" value={formatMoney(invoice.sub_total)} />

          <SummaryRow
            label="Advance Payment"
            value={`- ${formatMoney(invoice.advance_payment)}`}
          />

          <SummaryRow
            label="Amount Due"
            value={formatMoney(invoice.due_payment)}
            strong
          />
        </div>
      </div>

      {/* API Error */}

      {error ? (
        <div
          role="alert"
          className="mx-5 mb-5 flex items-start gap-3 border-l-2 border-red-600 bg-red-50 px-4 py-3 sm:mx-7 sm:mb-7"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

          <p className="text-sm text-red-700">
            {typeof error === "string"
              ? error
              : error?.message || "Unable to process the invoice request."}
          </p>
        </div>
      ) : null}

      {/* Success Message */}

      {successMessage ? (
        <div className="mx-5 mb-5 flex items-start gap-3 border-l-2 border-emerald-600 bg-emerald-50 px-4 py-3 sm:mx-7 sm:mb-7">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

          <p className="text-sm text-emerald-700">{successMessage}</p>
        </div>
      ) : null}

      {/* Customer Decision */}

      <footer className="border-t border-gray-200 bg-gray-50 px-5 py-5 sm:px-7">
        {canCustomerDecide ? (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="font-semibold text-gray-950">
                Review and confirm this invoice
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                Check the service price, discount, advance payment, and due
                amount before submitting your final decision.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  handleDecision(true);
                }}
                disabled={decisionLoading}
                className="inline-flex h-11 items-center justify-center gap-2 bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="h-4 w-4" />

                {decisionLoading && submittingDecision === true
                  ? "Submitting..."
                  : "I Agree"}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleDecision(false);
                }}
                disabled={decisionLoading}
                className="inline-flex h-11 items-center justify-center gap-2 border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 transition hover:border-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />

                {decisionLoading && submittingDecision === false
                  ? "Submitting..."
                  : "I Disagree"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            {invoice.customer_agreed === true ? (
              <>
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>
                  <p className="font-semibold text-emerald-700">
                    Invoice agreed
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    You have agreed with this invoice.
                  </p>
                </div>
              </>
            ) : null}

            {invoice.customer_agreed === false ? (
              <>
                <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div>
                  <p className="font-semibold text-red-700">
                    Invoice disagreed
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    You have disagreed with this invoice.
                  </p>
                </div>
              </>
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
      </footer>
    </section>
  );
};

export default CustomerInvoiceDetails;
