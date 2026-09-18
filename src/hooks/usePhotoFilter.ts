import { useMemo, useState } from 'react';
import type { FoodPhoto, PhotoFilters } from '@/types';

interface UsePhotoFilterResult {
  filters: PhotoFilters;
  setStatusFilter: (status: PhotoFilters['status']) => void;
  setCuisineFilter: (cuisine: string) => void;
  clearFilters: () => void;
  filtered: FoodPhoto[];
  availableCuisines: string[];
  activeFilterCount: number;
}

const DEFAULT_FILTERS: PhotoFilters = {
  status: 'all',
  cuisine: '',
};

export function usePhotoFilter(photos: FoodPhoto[]): UsePhotoFilterResult {
  const [filters, setFilters] = useState<PhotoFilters>(DEFAULT_FILTERS);

  const setStatusFilter = (status: PhotoFilters['status']) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const setCuisineFilter = (cuisine: string) => {
    setFilters((prev) => ({ ...prev, cuisine }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const availableCuisines = useMemo(() => {
    const set = new Set(photos.map((p) => p.cuisine));
    return Array.from(set).sort();
  }, [photos]);

  const filtered = useMemo(() => {
    return photos.filter((photo) => {
      if (filters.status !== 'all' && photo.review_status !== filters.status) {
        return false;
      }
      if (
        filters.cuisine &&
        photo.cuisine.toLowerCase() !== filters.cuisine.toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [photos, filters]);

  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) + (filters.cuisine ? 1 : 0);

  return {
    filters,
    setStatusFilter,
    setCuisineFilter,
    clearFilters,
    filtered,
    availableCuisines,
    activeFilterCount,
  };
}


