export default function Loading() {
  return (
    <div className="min-h-screen bg-primary-palest pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10 mt-6 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex items-start gap-4 mb-6">
            <div className="size-12 rounded-full bg-basic-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-basic-100 rounded w-1/4" />
              <div className="h-3 bg-basic-100 rounded w-1/6" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-3 mb-6">
            <div className="h-4 bg-basic-100 rounded w-full" />
            <div className="h-4 bg-basic-100 rounded w-5/6" />
            <div className="h-4 bg-basic-100 rounded w-4/6" />
          </div>

          {/* Tags Skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="h-6 bg-basic-100 rounded-full w-16" />
            <div className="h-6 bg-basic-100 rounded-full w-20" />
            <div className="h-6 bg-basic-100 rounded-full w-24" />
          </div>

          {/* Stats Skeleton */}
          <div className="flex gap-6">
            <div className="h-8 bg-basic-100 rounded w-16" />
            <div className="h-8 bg-basic-100 rounded w-16" />
            <div className="h-8 bg-basic-100 rounded w-16" />
          </div>
        </div>

        {/* Comment Section Skeleton */}
        <div className="mt-6 bg-basic-white rounded-2xl p-4 md:p-8 lg:p-10 animate-pulse">
          <div className="h-6 bg-basic-100 rounded w-1/4 mb-4" />
          <div className="space-y-4">
            <div className="h-20 bg-basic-100 rounded" />
            <div className="h-20 bg-basic-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
