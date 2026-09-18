import { useCallback, useMemo, useState } from 'react';
import { usePhotos } from '@/hooks/usePhotos';
import { usePhotoFilter } from '@/hooks/usePhotoFilter';
import { PhotoGrid } from '@/components/PhotoGrid';
import { PhotoDetail } from '@/components/PhotoDetail';
import { FilterBar } from '@/components/FilterBar';
import { ErrorState, LoadingState, EmptyState } from '@/components/States';
import type { FoodPhoto, ReviewStatus } from '@/types';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [selectedPhoto, setSelectedPhoto] = useState<FoodPhoto | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');

  const { photos, loading, error, refetch, updatePhotoInList } = usePhotos();

  const {
    filters,
    setStatusFilter: setFilterStatus,
    setCuisineFilter,
    clearFilters,
    filtered,
    availableCuisines,
    activeFilterCount,
  } = usePhotoFilter(photos);

  const handleStatusChange = useCallback(
    (status: ReviewStatus | 'all') => {
      setStatusFilter(status);
      setFilterStatus(status);
    },
    [setFilterStatus],
  );

  const selectedIndex = useMemo(() => {
    if (!selectedPhoto) return -1;
    return filtered.findIndex((p) => p.id === selectedPhoto.id);
  }, [filtered, selectedPhoto]);

  const handleNext = useCallback(() => {
    if (filtered.length === 0) return;
    const nextIdx = (selectedIndex + 1) % filtered.length;
    setSelectedPhoto(filtered[nextIdx]);
  }, [filtered, selectedIndex]);

  const handlePrev = useCallback(() => {
    if (filtered.length === 0) return;
    const prevIdx = (selectedIndex - 1 + filtered.length) % filtered.length;
    setSelectedPhoto(filtered[prevIdx]);
  }, [filtered, selectedIndex]);

  const handlePhotoUpdated = useCallback(
    (updated: FoodPhoto) => {
      updatePhotoInList(updated);
      setSelectedPhoto(updated);
    },
    [updatePhotoInList],
  );

  const pendingCount = photos.filter((p) => p.review_status === 'pending').length;
  const approvedCount = photos.filter((p) => p.review_status === 'approved').length;
  const rejectedCount = photos.filter((p) => p.review_status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Food Photo Review Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Review and moderate submitted food photographs
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-6">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">
                {photos.length}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Total
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-amber-600">
                {pendingCount}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Pending
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-emerald-600">
                {approvedCount}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Approved
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-rose-600">
                {rejectedCount}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Rejected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <FilterBar
            filters={filters}
            availableCuisines={availableCuisines}
            activeFilterCount={activeFilterCount}
            onStatusChange={handleStatusChange}
            onCuisineChange={setCuisineFilter}
            onClear={clearFilters}
          />
        </div>

        {error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState message="No photos match the current filters." />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
            <div>
              <p className="mb-3 text-sm text-gray-500">
                Showing {filtered.length} of {photos.length} photos
              </p>
              <PhotoGrid
                photos={filtered}
                selectedId={selectedPhoto?.id ?? null}
                onSelect={setSelectedPhoto}
              />
            </div>

            <div className="lg:sticky lg:top-32">
              {selectedPhoto ? (
                <PhotoDetail
                  photo={selectedPhoto}
                  onUpdated={handlePhotoUpdated}
                  onClose={() => setSelectedPhoto(null)}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-12 text-center">
                  <ChevronRight className="h-8 w-8 text-gray-300" aria-hidden="true" />
                  <p className="text-sm font-medium text-gray-600">
                    Select a photo to review
                  </p>
                  <p className="text-xs text-gray-400">
                    Click any photo in the grid, or use arrow keys to navigate
                  </p>
                </div>
              )}

              {selectedPhoto && filtered.length > 1 && (
                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    Previous
                  </button>
                  <span className="text-xs text-gray-400">
                    {selectedIndex + 1} of {filtered.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
