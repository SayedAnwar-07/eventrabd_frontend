const FormField = ({
  id,
  label,
  icon: Icon,
  error,
  optionalText,
  children,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-semibold text-gray-800"
      >
        {Icon ? <Icon className="h-4 w-4 text-[#b60018]" /> : null}

        <span>{label}</span>

        {optionalText ? (
          <span className="text-xs font-normal text-gray-500">
            {optionalText}
          </span>
        ) : null}
      </label>

      {children}

      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

export default FormField;
