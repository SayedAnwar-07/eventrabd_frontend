export default function BrandSkeleton() {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <div className="animate-pulse space-y-4">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
        </div>
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
