import {
  FeaturedSkeleton,
  ArticleCardSkeleton,
  SidebarSkeleton,
} from "@/components/SkeletonLoader";

export default function HomeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner Ad placeholder */}
      <div className="h-[90px] bg-gray-50 rounded-lg mb-8 animate-pulse" />

      {/* Featured Hero Skeleton */}
      <FeaturedSkeleton />

      {/* Main Content + Sidebar */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="h-8 w-40 bg-gray-100 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <SidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
