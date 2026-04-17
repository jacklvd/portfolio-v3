// components/skeleton-loading.tsx
export default function SkeletonLoading() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16">
        {/* Header skeleton */}
        <div className="flex flex-col items-center justify-center mb-16">
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-4"></div>
          <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
        </div>

        {/* About section skeleton */}
        <div className="mb-16">
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse col-span-1"></div>
            <div className="col-span-2 space-y-4">
              <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="h-6 w-5/6 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="h-6 w-4/6 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Experience section skeleton */}
        <div className="mb-16">
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-6"></div>
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse"
              >
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded-md mb-4"></div>
                <div className="h-6 w-64 bg-gray-200 dark:bg-gray-800 rounded-md mb-4"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                <div className="h-5 w-5/6 bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                <div className="h-5 w-4/6 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects section skeleton */}
        <div className="mb-16">
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 animate-pulse"
              >
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-md mb-4"></div>
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                <div className="h-5 w-5/6 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional skeleton for Footer */}
        <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}
