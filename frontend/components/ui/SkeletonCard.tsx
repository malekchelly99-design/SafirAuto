export default function SkeletonCard() {
  return (
    <div className="bg-[#23272e] dark:bg-[#16161a] border border-black/10 dark:border-white/5 rounded-xl overflow-hidden">
      <div className="aspect-[16/10] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-20 skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-1/2 skeleton rounded" />
        <div className="flex gap-4 pt-2">
          <div className="h-3 w-16 skeleton rounded" />
          <div className="h-3 w-16 skeleton rounded" />
          <div className="h-3 w-16 skeleton rounded" />
        </div>
        <div className="h-7 w-28 skeleton rounded mt-2" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

