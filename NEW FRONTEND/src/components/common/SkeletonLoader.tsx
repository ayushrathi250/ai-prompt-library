interface SkeletonLoaderProps {
  count?: number;
}

function SkeletonCard() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-edge bg-surface/70 p-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 w-28 rounded-full" />
        <div className="skeleton h-4 w-12 rounded" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3.5 w-full rounded" />
        <div className="skeleton h-3.5 w-5/6 rounded" />
      </div>
      <div className="skeleton h-20 w-full rounded-lg" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-5 w-14 rounded-md" />
        <div className="skeleton h-5 w-20 rounded-md" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-edge pt-3">
        <div className="skeleton h-3.5 w-24 rounded" />
        <div className="flex gap-1.5">
          <div className="skeleton h-7 w-7 rounded-lg" />
          <div className="skeleton h-7 w-7 rounded-lg" />
          <div className="skeleton h-7 w-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLoader({ count = 6 }: SkeletonLoaderProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }: SkeletonLoaderProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-edge bg-surface/70 p-5">
          <div className="skeleton mb-4 h-9 w-9 rounded-xl" />
          <div className="skeleton h-8 w-16 rounded" />
          <div className="skeleton mt-2 h-3.5 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
