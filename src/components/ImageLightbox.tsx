import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect } from "react";

interface Props {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }: Props) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    },
    [currentIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-muted transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
          className="absolute left-4 z-50 rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
          className="absolute right-4 z-50 rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <img
        src={images[currentIndex]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute bottom-4 text-sm text-muted-foreground">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageLightbox;
