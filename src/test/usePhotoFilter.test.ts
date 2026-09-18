import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhotoFilter } from '@/hooks/usePhotoFilter';
import type { FoodPhoto } from '@/types';

const mockPhotos: FoodPhoto[] = [
  {
    id: '1',
    image_url: 'https://example.com/1.jpg',
    caption: 'Pasta dish',
    cuisine: 'Italian',
    photographer: 'Chef A',
    review_status: 'pending',
    review_notes: null,
    reviewed_at: null,
    created_at: '2026-09-10T00:00:00Z',
  },
  {
    id: '2',
    image_url: 'https://example.com/2.jpg',
    caption: 'Sushi platter',
    cuisine: 'Japanese',
    photographer: 'Chef B',
    review_status: 'approved',
    review_notes: 'Great photo',
    reviewed_at: '2026-09-12T00:00:00Z',
    created_at: '2026-09-09T00:00:00Z',
  },
  {
    id: '3',
    image_url: 'https://example.com/3.jpg',
    caption: 'Tacos',
    cuisine: 'Mexican',
    photographer: 'Chef C',
    review_status: 'rejected',
    review_notes: 'Blurry',
    reviewed_at: '2026-09-13T00:00:00Z',
    created_at: '2026-09-08T00:00:00Z',
  },
  {
    id: '4',
    image_url: 'https://example.com/4.jpg',
    caption: 'Risotto',
    cuisine: 'Italian',
    photographer: 'Chef D',
    review_status: 'pending',
    review_notes: null,
    reviewed_at: null,
    created_at: '2026-09-11T00:00:00Z',
  },
];

describe('usePhotoFilter', () => {
  it('returns all photos when no filters are active', () => {
    const { result } = renderHook(() => usePhotoFilter(mockPhotos));
    expect(result.current.filtered).toHaveLength(4);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('filters by status correctly', () => {
    const { result } = renderHook(() => usePhotoFilter(mockPhotos));
    act(() => {
      result.current.setStatusFilter('pending');
    });
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.every((p) => p.review_status === 'pending')).toBe(true);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('filters by cuisine correctly', () => {
    const { result } = renderHook(() => usePhotoFilter(mockPhotos));
    act(() => {
      result.current.setCuisineFilter('Italian');
    });
    expect(result.current.filtered).toHaveLength(2);
    expect(result.current.filtered.every((p) => p.cuisine === 'Italian')).toBe(true);
  });

  it('combines status and cuisine filters', () => {
    const { result } = renderHook(() => usePhotoFilter(mockPhotos));
    act(() => {
      result.current.setStatusFilter('approved');
      result.current.setCuisineFilter('Japanese');
    });
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].id).toBe('2');
    expect(result.current.activeFilterCount).toBe(2);
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => usePhotoFilter(mockPhotos));
    act(() => {
      result.current.setStatusFilter('approved');
      result.current.setCuisineFilter('Japanese');
    });
    expect(result.current.activeFilterCount).toBe(2);
    act(() => {
      result.current.clearFilters();
    });
    expect(result.current.filtered).toHaveLength(4);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('extracts available cuisines from photos', () => {
    const { result } = renderHook(() => usePhotoFilter(mockPhotos));
    expect(result.current.availableCuisines).toEqual([
      'Italian',
      'Japanese',
      'Mexican',
    ]);
  });

  it('returns empty array for empty photo list', () => {
    const { result } = renderHook(() => usePhotoFilter([]));
    expect(result.current.filtered).toHaveLength(0);
    expect(result.current.availableCuisines).toEqual([]);
  });
});
