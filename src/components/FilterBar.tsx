import type { PhotoFilters } from '@/types';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  filters: PhotoFilters;
  availableCuisines: string[];
  activeFilterCount: number;
  onStatusChange: (status: PhotoFilters['status']) => void;
  onCuisineChange: (cuisine: string) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: PhotoFilters['status']; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export function FilterBar({
  filters,
  availableCuisines,
  activeFilterCount,
  onStatusChange,
  onCuisineChange,
  onClear,
}: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      role="region"
      aria-label="Photo filters"
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="status-filter"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Review status
        </label>
        <select
          id="status-filter"
          value={filters.status}
          onChange={(e) =>
            onStatusChange(e.target.value as PhotoFilters['status'])
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="cuisine-filter"
          className="text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Cuisine
        </label>
        <select
          id="cuisine-filter"
          value={filters.cuisine}
          onChange={(e) => onCuisineChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        >
          <option value="">All cuisines</option>
          {availableCuisines.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </select>
      </div>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-200"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear filters ({activeFilterCount})
        </button>
      )}

      <div className="ml-auto flex items-center gap-2 text-sm text-gray-400">
        <Filter className="h-4 w-4" aria-hidden="true" />
        <span>{activeFilterCount} active</span>
      </div>
    </div>
  );
}


