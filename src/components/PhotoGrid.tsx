import type { FoodPhoto } from '@/types';
import { PhotoCard } from './PhotoCard';

interface PhotoGridProps {
  photos: FoodPhoto[];
  selectedId: string | null;
  onSelect: (photo: FoodPhoto) => void;
}

export function PhotoGrid({ photos, selectedId, onSelect }: PhotoGridProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Food photos"
    >
      {photos.map((photo) => (
        <div key={photo.id} role="listitem">
          <PhotoCard
            photo={photo}
            isSelected={selectedId === photo.id}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
