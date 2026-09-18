import { useEffect, useReducer, useState } from 'react';
import type { FoodPhoto } from '@/types';
import { photosApi } from '@/api/photosApi';
import { reviewReducer } from '@/hooks/reviewReducer';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface PhotoDetailProps {
  photo: FoodPhoto;
  onUpdated: (updated: FoodPhoto) => void;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PhotoDetail({
  photo,
  onUpdated,
  onClose,
  onNext,
  onPrev,
}: PhotoDetailProps) {
  const [decision, dispatch] = useReducer(reviewReducer, null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(photo.review_notes ?? '');
    setSubmitError(null);
    dispatch({ type: 'RESET', photo });
  }, [photo.id, photo.review_notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (decision && !submitting) {
          submitReview();
      }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decision, submitting, notes, photo.id]);

  const submitReview = async () => {
    if (!decision) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await photosApi.updateReviewStatus(photo.id, {
        review_status: decision.status,
        review_notes: notes.trim() || null,
      });
      onUpdated(updated);
      dispatch({ type: 'RESET', photo });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update review';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = decision !== null && !submitting;
  const isApprove = decision?.status === 'approved';
  const isReject = decision?.status === 'rejected';

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      role="region"
      aria-label={`Review detail for ${photo.caption}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-gray-900">
            {photo.caption}
          </h2>
          <p className="text-sm text-gray-500">
            by {photo.photographer} &middot; {photo.cuisine}
          </p>
        </div>
        <StatusBadge status={photo.review_status} />
      </div>

      <div className="overflow-hidden rounded-lg">
        <img
          src={photo.image_url}
          alt={photo.caption}
          className="h-64 w-full object-cover"
        />
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
        <p>
          <span className="font-semibold">Cuisine:</span> {photo.cuisine}
        </p>
        <p>
          <span className="font-semibold">Photographer:</span>{' '}
          {photo.photographer}
        </p>
        <p>
          <span className="font-semibold">Submitted:</span>{' '}
          {new Date(photo.created_at).toLocaleDateString()}
        </p>
        {photo.reviewed_at && (
          <p>
            <span className="font-semibold">Last reviewed:</span>{' '}
            {new Date(photo.reviewed_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div role="group" aria-label="Review actions">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Review decision
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              dispatch({ type: 'APPROVE', photo, notes: notes.trim() })
            }
            aria-pressed={isApprove}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
              isApprove
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle className="h-4 w-4" aria-hidden="true" />
            Approve
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({ type: 'REJECT', photo, notes: notes.trim() })
            }
            aria-pressed={isReject}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-rose-300 ${
              isReject
                ? 'bg-rose-600 text-white'
                : 'bg-white text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50'
            }`}
          >
            <XCircle className="h-4 w-4" aria-hidden="true" />
            Reject
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="review-notes"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Review notes {decision ? '(required for reject, optional for approve)' : '(select a decision first)'}
        </label>
        <textarea
          id="review-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          disabled={!decision}
          placeholder={
            decision
              ? 'Add notes about this review decision...'
              : 'Select Approve or Reject to add notes'
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-50 disabled:text-gray-400"
        />
      </div>

      {submitError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={submitReview}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            'Submit review'
          )}
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'RESET', photo })}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </button>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Close (Esc)
        </button>
      </div>

      <p className="border-t border-gray-100 pt-3 text-xs text-gray-400">
        Keyboard: <kbd className="font-sans font-semibold">←</kbd> /{' '}
        <kbd className="font-sans font-semibold">→</kbd> to navigate photos{' '}
        <kbd className="font-sans font-semibold">Esc</kbd> to close{' '}
        <kbd className="font-sans font-semibold">Ctrl+Enter</kbd> to submit
      </p>
    </div>
  );
}
