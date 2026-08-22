export default function PageShell({ children, className = "" }) {
  return (
    <div
      className={`mx-auto w-full max-w-400 px-4 py-8 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
