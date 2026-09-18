import { describe, it, expect } from 'vitest';
import { reviewReducer } from '@/hooks/reviewReducer';
import type { FoodPhoto } from '@/types';

const mockPhoto: FoodPhoto = {
  id: 'abc-123',
  image_url: 'https://example.com/photo.jpg',
  caption: 'Test dish',
  cuisine: 'French',
  photographer: 'Test Chef',
  review_status: 'pending',
  review_notes: null,
  reviewed_at: null,
  created_at: '2026-09-10T00:00:00Z',
};

describe('reviewReducer', () => {
  it('returns null for RESET on initial state', () => {
    const result = reviewReducer(null, { type: 'RESET', photo: mockPhoto });
    expect(result).toBeNull();
  });

  it('sets approved status on APPROVE', () => {
    const result = reviewReducer(null, {
      type: 'APPROVE',
      photo: mockPhoto,
      notes: 'Looks great',
    });
    expect(result).toEqual({
      photoId: 'abc-123',
      status: 'approved',
      notes: 'Looks great',
    });
  });

  it('sets rejected status on REJECT', () => {
    const result = reviewReducer(null, {
      type: 'REJECT',
      photo: mockPhoto,
      notes: 'Too dark',
    });
    expect(result).toEqual({
      photoId: 'abc-123',
      status: 'rejected',
      notes: 'Too dark',
    });
  });

  it('defaults notes to empty string when not provided', () => {
    const approveResult = reviewReducer(null, {
      type: 'APPROVE',
      photo: mockPhoto,
    });
    expect(approveResult?.notes).toBe('');

    const rejectResult = reviewReducer(null, {
      type: 'REJECT',
      photo: mockPhoto,
    });
    expect(rejectResult?.notes).toBe('');
  });

  it('resets to null from an active decision', () => {
    const approved = reviewReducer(null, {
      type: 'APPROVE',
      photo: mockPhoto,
      notes: 'Nice',
    });
    expect(approved).not.toBeNull();

    const reset = reviewReducer(approved, {
      type: 'RESET',
      photo: mockPhoto,
    });
    expect(reset).toBeNull();
  });

  it('preserves current state for unknown action type', () => {
    const currentState = {
      photoId: 'abc-123',
      status: 'approved' as const,
      notes: 'Good',
    };
    const result = reviewReducer(currentState, {
      type: 'RESET',
      photo: mockPhoto,
    });
    expect(result).toBeNull();
  });
});
