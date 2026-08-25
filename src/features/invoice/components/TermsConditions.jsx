import { ListChecks, Plus, Trash2 } from "lucide-react";

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
    <div className="mt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[#b60018]" />

            <h3 className="text-sm font-semibold text-gray-800">
              Terms & Conditions
            </h3>

            <span className="text-xs font-normal text-gray-500">Optional</span>
          </div>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Add up to {MAX_TERMS_CONDITIONS} invoice terms.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={loading || terms.length >= MAX_TERMS_CONDITIONS}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#b60018] bg-white px-4 text-xs font-semibold text-[#b60018] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
        >
          <Plus className="h-4 w-4" />
          Add Term
        </button>
      </div>

      {terms.length > 0 ? (
        <div className="mt-4 space-y-3">
          {terms.map((term, index) => {
            const termError = Array.isArray(errors) ? errors[index] : null;

            return (
              <div
                key={`invoice-term-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-[#b60018]">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <textarea
                      rows={2}
                      maxLength={MAX_TERM_LENGTH}
                      value={term}
                      onChange={(event) => onChange(index, event.target.value)}
                      disabled={loading}
                      placeholder={`Enter term ${index + 1}`}
                      className={`w-full resize-y rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-950 outline-none transition ${
                        termError
                          ? "border-red-400 focus:border-red-600"
                          : "border-gray-300 focus:border-[#b60018]"
                      }`}
                    />

                    <div className="mt-1 flex items-start justify-between gap-3">
                      <div>
                        {termError ? (
                          <p className="text-xs text-red-600">{termError}</p>
                        ) : null}
                      </div>

                      <p className="shrink-0 text-[11px] text-gray-400">
                        {term.length}/{MAX_TERM_LENGTH}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    disabled={loading}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center">
          <p className="text-sm text-gray-500">
            No terms and conditions added.
          </p>

          <p className="mt-1 text-xs text-gray-400">This field is optional.</p>
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <p className="text-xs text-gray-500">
          {terms.length}/{MAX_TERMS_CONDITIONS} terms added
        </p>
      </div>
    </div>
  );
};

export default TermsConditions;
