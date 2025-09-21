import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/ui/container';

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-basic-100 relative">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Container>
          {/* Tabs Skeleton */}
          <div className="border-b border-basic-200 mb-4 sm:mb-8 flex justify-center bg-basic-100 py-2 sm:py-4 px-4">
            <div className="w-full max-w-3xl">
              <nav className="flex items-center justify-between -mb-px">
                <div className="flex space-x-2 sm:space-x-4 lg:space-x-8">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <Skeleton className="h-8 w-16" />
              </nav>
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-8 mb-16">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex flex-col items-center space-y-6">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto bg-basic-white rounded-2xl shadow-sm border border-basic-100 p-3 sm:p-4 md:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 sm:mr-3" />
                      <div>
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <Skeleton className="h-5 w-16 hidden sm:block" />
                      <Skeleton className="h-3 w-16 hidden sm:block" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Title */}
                  <Skeleton className="h-6 w-3/4 mb-2" />

                  {/* Description */}
                  <div className="space-y-2 mb-3 sm:mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>

                  {/* Progress (for some cards) */}
                  {index !== 1 && (
                    <div className="mb-3 sm:mb-4">
                      <Skeleton className="h-2 w-full" />
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>

                  {/* Actions */}
                  <div className="pt-3 sm:pt-4 border-t border-basic-100">
                    <div className="flex items-center space-x-2 sm:space-x-4">
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-6 w-8" />
                      <Skeleton className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </main>

      {/* Floating button skeleton */}
      <div className="fixed bottom-6 right-6 z-50">
        <Skeleton className="h-16 w-16 rounded-full" />
      </div>
    </div>
  );
}