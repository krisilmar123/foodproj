import type { FoodPhoto, ReviewStatus } from '@/types';

export type ReviewAction =
  | { type: 'APPROVE'; photo: FoodPhoto; notes?: string }
  | { type: 'REJECT'; photo: FoodPhoto; notes?: string }
  | { type: 'RESET'; photo: FoodPhoto };

export interface ReviewDecisionState {
  photoId: string;
  status: ReviewStatus;
  notes: string;
}

const EMPTY_NOTES = '';

export function reviewReducer(
  state: ReviewDecisionState | null,
  action: ReviewAction,
): ReviewDecisionState | null {
  switch (action.type) {
    case 'APPROVE':
      return {
        photoId: action.photo.id,
        status: 'approved',
        notes: action.notes ?? EMPTY_NOTES,
      };
    case 'REJECT':
      return {
        photoId: action.photo.id,
        status: 'rejected',
        notes: action.notes ?? EMPTY_NOTES,
      };
    case 'RESET':
      return null;
    default:
      return state;
  }
}
