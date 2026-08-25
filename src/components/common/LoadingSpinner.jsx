import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-10 w-10",
  };

  return (
    <div className="flex min-h-screen items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />

      {text && (
        <span className="text-sm font-medium text-muted-foreground">
          {text}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
