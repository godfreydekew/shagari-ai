import { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageLightboxProps {
  src: string | null;
  alt: string;
  open: boolean;
  onClose: () => void;
}

export default function ImageLightbox({
  src,
  alt,
  open,
  onClose,
}: ImageLightboxProps) {
  const zoomLevels = [
    { value: 1, className: "scale-100" },
    { value: 1.25, className: "scale-125" },
    { value: 1.5, className: "scale-150" },
    { value: 1.75, className: "scale-[1.75]" },
    { value: 2, className: "scale-200" },
    { value: 2.5, className: "scale-[2.5]" },
    { value: 3, className: "scale-[3]" },
    { value: 3.5, className: "scale-[3.5]" },
    { value: 4, className: "scale-[4]" },
  ];
  const [zoomIndex, setZoomIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setZoomIndex(0);
      return;
    }

    function handleEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !src) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image zoom viewer"
    >
      <div
        className="flex items-center justify-between p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomIndex((i) => Math.max(0, i - 1))}
            className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-white text-xs font-medium min-w-14 text-center">
            {Math.round(zoomLevels[zoomIndex].value * 100)}%
          </span>
          <button
            type="button"
            onClick={() =>
              setZoomIndex((i) => Math.min(zoomLevels.length - 1, i + 1))
            }
            className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div
        className="flex-1 overflow-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-full min-w-full flex items-center justify-center">
          <img
            src={src}
            alt={alt}
            className={`max-w-[85vw] max-h-[75vh] object-contain transition-transform duration-150 ${zoomLevels[zoomIndex].className}`}
          />
        </div>
      </div>
    </div>
  );
}
