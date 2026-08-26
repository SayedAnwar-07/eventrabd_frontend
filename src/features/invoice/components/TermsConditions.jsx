import { Plus, Trash2 } from "lucide-react";

const MAX_TERMS_CONDITIONS = 3;
const MAX_TERM_LENGTH = 300;

const TermsConditions = ({
  terms,
  errors,
  loading,
  onAdd,
  onChange,
  onRemove,
}) => {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-950">
            Payment Terms & Conditions
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Add up to {MAX_TERMS_CONDITIONS} optional terms for the customer.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={loading || terms.length >= MAX_TERMS_CONDITIONS}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 text-xs font-medium text-gray-700 transition hover:border-[#b60018] hover:bg-red-50 hover:text-[#b60018] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add Term
        </button>
      </div>

      {/* Terms */}
      {terms.length > 0 ? (
        <div className="mt-5">
          {terms.map((term, index) => {
            const termError = Array.isArray(errors) ? errors[index] : null;

            return (
              <div
                key={`invoice-term-${index}`}
                className={`py-4 ${
                  index !== 0 ? "border-t border-gray-200" : ""
                }`}
              >
                {/* Term Header */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">
                      Term {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={loading}
                    aria-label={`Remove term ${index + 1}`}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-[#b60018] transition hover:bg-red-50 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  rows={3}
                  maxLength={MAX_TERM_LENGTH}
                  value={term}
                  onChange={(event) => onChange(index, event.target.value)}
                  disabled={loading}
                  placeholder={`Enter payment term ${index + 1}`}
                  className={`min-h-24 w-full resize-y rounded-md border bg-white px-3 py-3 text-sm leading-6 text-gray-950 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    termError
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-gray-300 focus:border-[#b60018] focus:ring-2 focus:ring-red-100"
                  }`}
                />

                {/* Bottom Row */}
                <div className="mt-1.5 flex min-h-4 items-start justify-between gap-3">
                  <div>
                    {termError ? (
                      <p className="text-xs text-red-600">{termError}</p>
                    ) : null}
                  </div>

                  <span className="shrink-0 text-[11px] text-gray-400">
                    {term.length}/{MAX_TERM_LENGTH}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="border-t border-gray-200 pt-3 text-right">
            <span className="text-[11px] text-gray-400">
              {terms.length} of {MAX_TERMS_CONDITIONS} terms added
            </span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="mt-5 rounded-md border border-dashed border-gray-300 px-4 py-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No terms added yet
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Add optional payment terms if needed for this invoice.
          </p>
        </div>
      )}
    </div>
  );
};

export default TermsConditions;
