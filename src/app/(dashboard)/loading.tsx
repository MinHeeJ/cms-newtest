export default function DashboardLoading() {
  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar" aria-busy="true" aria-live="polite">
      <div className="mb-8 flex flex-col gap-3">
        <div className="h-6 w-48 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-stone-100" />
      </div>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="rounded-lg border border-stone-200 bg-white p-6" key={index}>
            <div className="mb-4 flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                <div className="h-3 w-32 animate-pulse rounded bg-stone-100" />
              </div>
              <div className="h-10 w-10 animate-pulse rounded-lg bg-stone-100" />
            </div>
            <div className="h-8 w-16 animate-pulse rounded bg-stone-200" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-stone-200 bg-white">
        <div className="border-b border-stone-200 p-6">
          <div className="h-5 w-36 animate-pulse rounded bg-stone-200" />
        </div>
        <div className="space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="h-12 animate-pulse rounded bg-stone-50" key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
