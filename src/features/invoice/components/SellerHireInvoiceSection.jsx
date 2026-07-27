import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CreateInvoiceSection from "./CreateInvoiceSection";

import {
  fetchInvoices,
  selectInvoiceError,
  selectInvoiceLoading,
  selectInvoices,
} from "@/store/features/invoice/invoiceSlice";
import EditInvoiceDialog from "./EditInvoiceDialog";

const PAYMENT_STATUS_CONFIG = {
  paid: {
    label: "Paid",
    className:
      "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
  },
  partially_paid: {
    label: "Partially Paid",
    className:
      "border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
  },
  unpaid: {
    label: "Unpaid",
    className:
      "border-slate-500 bg-slate-50 text-slate-700 dark:bg-slate-950/20 dark:text-slate-300",
  },
  overdue: {
    label: "Overdue",
    className:
      "border-red-600 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
  },
};

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
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getInvoiceHireId = (invoice) => {
  if (!invoice) {
    return null;
  }

  if (invoice.hire && typeof invoice.hire === "object") {
    return invoice.hire.id ?? null;
  }

  return invoice.hire ?? invoice.hire_id ?? null;
};

const PaymentStatusBadge = ({ status }) => {
  const config = PAYMENT_STATUS_CONFIG[status] ?? PAYMENT_STATUS_CONFIG.unpaid;

  return (
    <span
      className={`inline-flex min-h-7 items-center border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
};

const FinancialItem = ({ label, value, emphasized = false }) => {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p
        className={`mt-1 ${
          emphasized ? "text-lg font-semibold" : "text-sm font-medium"
        }`}
      >
        {formatMoney(value)}
      </p>
    </div>
  );
};

const ExistingInvoiceDetails = ({ invoice }) => {
  const customerName =
    invoice.customer?.full_name ||
    invoice.customer_name_snapshot ||
    "Not available";

  const sellerName =
    invoice.seller?.full_name ||
    invoice.seller_name_snapshot ||
    "Not available";

  const brandName =
    invoice.brand?.brand_name || invoice.brand_name_snapshot || "Not available";

  const serviceName =
    invoice.service?.service_display_name ||
    invoice.service?.service_name ||
    invoice.service_name_snapshot ||
    "Not available";

  return (
    <section className="border-t border-border">
      <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Existing Invoice
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {invoice.invoice_number || "Invoice details"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Created {formatDateTime(invoice.created_at)}
          </p>
        </div>

        <PaymentStatusBadge status={invoice.payment_status} />
      </div>

      {invoice.is_overdue ? (
        <div className="border-b border-red-600 bg-red-50 px-6 py-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-400">
          This invoice is overdue. The payment due date was{" "}
          <strong>{formatDate(invoice.due_payment_last_date)}</strong>.
        </div>
      ) : null}

      {!invoice.is_overdue && invoice.payment_status !== "paid" ? (
        <div className="border-b border-amber-600 bg-amber-50 px-6 py-4 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          Remaining payment should be completed by{" "}
          <strong>{formatDate(invoice.due_payment_last_date)}</strong>.
        </div>
      ) : null}

      <div className="grid gap-6 px-6 py-5 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Customer</p>

          <p className="mt-1 font-medium">{customerName}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Seller</p>

          <p className="mt-1 font-medium">{sellerName}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Brand</p>

          <p className="mt-1 font-medium">{brandName}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Service</p>

          <p className="mt-1 font-medium capitalize">{serviceName}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">Issue Date</p>

          <p className="mt-1 font-medium">{formatDate(invoice.issue_date)}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">
            Due Payment Date
          </p>

          <p className="mt-1 font-medium">
            {formatDate(invoice.due_payment_last_date)}
          </p>
        </div>
      </div>

      <div className="border-t border-border px-6 py-5">
        <h3 className="font-semibold">Financial Summary</h3>

        <div className="mt-5 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          <FinancialItem label="Service Price" value={invoice.service_price} />

          <FinancialItem label="Discount" value={invoice.discount_price} />

          <FinancialItem
            label="Subtotal"
            value={invoice.sub_total ?? invoice.service_price}
          />

          <FinancialItem label="Total" value={invoice.total} emphasized />

          <FinancialItem label="Advance" value={invoice.advance_payment} />

          <FinancialItem
            label="Due Payment"
            value={invoice.due_payment}
            emphasized
          />
        </div>
      </div>

      {invoice.seller_note ? (
        <div className="border-t border-border px-6 py-5">
          <p className="text-xs uppercase text-muted-foreground">
            Invoice Note
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm">
            {invoice.seller_note}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {invoice.can_edit ? (
            <p className="text-sm text-muted-foreground">
              This invoice can still be edited before its due date.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              This invoice can no longer be edited.
            </p>
          )}
        </div>

        {invoice.can_edit ? (
          <EditInvoiceDialog invoice={invoice} />
        ) : (
          <button
            type="button"
            disabled
            className="min-h-10 cursor-not-allowed border border-border px-5 py-2 text-sm font-semibold text-muted-foreground opacity-60"
          >
            Editing Disabled
          </button>
        )}
      </div>
    </section>
  );
};

const SellerHireInvoiceSection = ({ hire }) => {
  const dispatch = useDispatch();

  const invoices = useSelector(selectInvoices);
  const loading = useSelector(selectInvoiceLoading);
  const error = useSelector(selectInvoiceError);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const hireId = hire?.id;

  const existingInvoice =
    hireId && Array.isArray(invoices)
      ? (invoices.find(
          (invoice) => String(getInvoiceHireId(invoice)) === String(hireId),
        ) ?? null)
      : null;

  const canCreateInvoice =
    hire?.status === "accepted" &&
    hire?.is_accept === true &&
    hire?.can_create_invoice === true;

  if (loading && invoices.length === 0) {
    return (
      <div className="border-t border-border px-6 py-5">
        <p className="text-sm text-muted-foreground">
          Loading invoice information...
        </p>
      </div>
    );
  }

  if (existingInvoice) {
    return <ExistingInvoiceDetails invoice={existingInvoice} />;
  }

  return (
    <>
      {error ? (
        <div className="border-t border-amber-600 bg-amber-50 px-6 py-4 text-sm text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          Existing invoice information could not be loaded. The backend will
          still prevent duplicate invoice creation.
        </div>
      ) : null}

      {canCreateInvoice ? (
        <CreateInvoiceSection key={hireId} hire={hire} />
      ) : (
        <div className="border-t border-border px-6 py-5">
          <p className="text-sm text-muted-foreground">
            This hire is not eligible for a new invoice or already has an
            invoice.
          </p>
        </div>
      )}
    </>
  );
};

export default SellerHireInvoiceSection;
