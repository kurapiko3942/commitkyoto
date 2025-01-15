// components/PhotoSlider.tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoSliderProps {
  photos: string[];
  placeName: string;
}

export const PhotoSlider = ({ photos, placeName }: PhotoSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!photos.length) return null;

  return (
    <div className="relative w-full h-40 mb-2 group">
      <img 
        src={photos[currentIndex]}
        alt={`${placeName} - Photo ${currentIndex + 1}`}
        className="w-full h-full object-cover rounded-lg"
      />
      
      {/* 写真カウンター */}
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* 前へボタン */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous photo"
      >
        <ChevronLeft size={20} />
      </button>

      {/* 次へボタン */}
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next photo"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};