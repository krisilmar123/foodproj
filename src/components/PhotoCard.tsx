import type { FoodPhoto } from '@/types';
import { StatusBadge } from './StatusBadge';

interface PhotoCardProps {
  photo: FoodPhoto;
  isSelected: boolean;
  onSelect: (photo: FoodPhoto) => void;
}

export function PhotoCard({ photo, isSelected, onSelect }: PhotoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(photo)}
      aria-pressed={isSelected}
      aria-label={`Review photo: ${photo.caption} by ${photo.photographer}, status: ${photo.review_status}`}
      className={`group relative overflow-hidden rounded-xl bg-gray-100 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 ${
        isSelected
          ? 'ring-2 ring-teal-500 ring-offset-2'
          : 'hover:shadow-lg hover:ring-1 hover:ring-teal-200'
      }`}
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          src={photo.image_url}
          alt={photo.caption}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-10">
        <p className="truncate text-sm font-medium text-white">
          {photo.caption}
        </p>
        <p className="truncate text-xs text-gray-300">{photo.photographer}</p>
      </div>

      <div className="absolute right-2 top-2">
        <StatusBadge status={photo.review_status} />
      </div>
    </button>
  );
}
