import { useCallback, useEffect, useState } from 'react';
import { photosApi } from '@/api/photosApi';
import type { FoodPhoto, ReviewStatus } from '@/types';

interface UsePhotosResult {
  photos: FoodPhoto[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updatePhotoInList: (updated: FoodPhoto) => void;
}

export function usePhotos(filters?: {
  status?: ReviewStatus;
  cuisine?: string;
}): UsePhotosResult {
  const [photos, setPhotos] = useState<FoodPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefetchIndex((i) => i + 1);
  }, []);

  const updatePhotoInList = useCallback((updated: FoodPhoto) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    photosApi
      .listPhotos(filters)
      .then((data) => {
        if (!cancelled) {
          setPhotos(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.cuisine, refetchIndex]);

  return { photos, loading, error, refetch, updatePhotoInList };
}
