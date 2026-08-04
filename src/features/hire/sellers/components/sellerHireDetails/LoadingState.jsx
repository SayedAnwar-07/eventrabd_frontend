export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-gray-200" />

          <div className="mt-6 h-40 rounded-2xl bg-gray-200" />

          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
            <div className="h-24 rounded-2xl bg-gray-100" />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="h-80 rounded-2xl bg-gray-100 lg:col-span-2" />

            <div className="h-80 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </main>
    </div>
  );
}
