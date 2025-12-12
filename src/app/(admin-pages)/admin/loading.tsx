export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="bg-muted/40 h-6 w-48 animate-pulse rounded" />
        <div className="bg-muted/30 h-4 w-72 animate-pulse rounded" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index + 1}
            className="border-muted bg-muted/30 h-28 animate-pulse rounded-xl border"
          />
        ))}
      </div>
    </div>
  );
}
