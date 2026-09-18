export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface FoodPhoto {
  id: string;
  image_url: string;
  caption: string;
  cuisine: string;
  photographer: string;
  review_status: ReviewStatus;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface PhotoFilters {
  status: ReviewStatus | 'all';
  cuisine: string;
}

export interface UpdateReviewPayload {
  review_status: ReviewStatus;
  review_notes?: string | null;
}

export interface ApiError {
  error: string;
  status: number;
}

export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: string };
