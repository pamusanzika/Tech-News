export function ArticleCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 animate-pulse">
      <div className="h-5 w-20 bg-gray-100 rounded-full" />
      <div className="mt-3 h-6 w-full bg-gray-100 rounded" />
      <div className="mt-2 h-6 w-3/4 bg-gray-100 rounded" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full bg-gray-50 rounded" />
        <div className="h-4 w-full bg-gray-50 rounded" />
        <div className="h-4 w-2/3 bg-gray-50 rounded" />
      </div>
      <div className="mt-4 h-4 w-24 bg-gray-50 rounded" />
    </div>
  );
}

export function FeaturedSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl p-8 md:p-12 animate-pulse">
      <div className="max-w-2xl">
        <div className="flex gap-3 mb-4">
          <div className="h-6 w-20 bg-white/30 rounded-full" />
          <div className="h-6 w-24 bg-white/20 rounded-full" />
        </div>
        <div className="h-10 w-full bg-white/20 rounded mb-3" />
        <div className="h-10 w-3/4 bg-white/20 rounded mb-6" />
        <div className="space-y-2 mb-6">
          <div className="h-5 w-full bg-white/10 rounded" />
          <div className="h-5 w-full bg-white/10 rounded" />
          <div className="h-5 w-2/3 bg-white/10 rounded" />
        </div>
        <div className="h-4 w-40 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-5 w-20 bg-gray-100 rounded-full mb-4" />
      <div className="h-10 w-full bg-gray-100 rounded mb-3" />
      <div className="h-10 w-3/4 bg-gray-100 rounded mb-6" />
      <div className="flex items-center gap-4 mb-10">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-4 w-24 bg-gray-100 rounded" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-5 bg-gray-50 rounded"
            style={{ width: `${85 + Math.random() * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-gray-50 rounded-lg min-h-[250px]" />
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 mb-4">
            <div className="h-7 w-7 bg-gray-200 rounded" />
            <div className="flex-1">
              <div className="h-4 w-full bg-gray-200 rounded mb-1" />
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
