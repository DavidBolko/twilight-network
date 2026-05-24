import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Modal from "./Modal";
import { getFromCdn } from "../utils";

type Props = {
  images: string[];
};

export default function Gallery({ images: rawImages }: Props) {
  const images = useMemo(() => rawImages.filter(Boolean), [rawImages]);

  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(0, images.length - 1)));
  }, [images.length]);

  if (images.length === 0) return null;

  const currentImage = images[Math.min(index, images.length - 1)];
  const currentUrl = getFromCdn(currentImage);

  const prev = () => {
    setIndex((current) => (current - 1 + images.length) % images.length);
  };

  const next = () => {
    setIndex((current) => (current + 1) % images.length);
  };

  const openLightbox = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <div className="rounded-lg overflow-hidden relative">
        <button type="button" className="w-full max-h-[70vh] bg-black/10 dark:bg-white/5" onClick={openLightbox} aria-label="Open images">
          <img src={currentUrl} alt="Post image" className="w-full h-full object-contain" loading="lazy" />
        </button>

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-tw-light-surface/30 hover:bg-tw-surface/60"
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-tw-light-surface/30 hover:bg-tw-surface/60"
              aria-label="Next image"
            >
              <ChevronRight />
            </button>

            <div className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md bg-tw-bg/20">
              {index + 1} / {images.length}
            </div>
          </>
        ) : null}
      </div>

      {open ? (
        <Modal onClose={() => setOpen(false)} background={false} lightbox={true}>
          <div className="relative w-fit mx-auto" onClick={(e) => e.stopPropagation()}>
            <img src={currentUrl} alt="Post image large" className="w-full max-h-[85vh] object-contain" />

            {images.length > 1 ? (
              <>
                <button type="button" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-md bg-tw-light-surface/30 hover:bg-tw-surface/60" aria-label="Previous image">
                  <ChevronLeft />
                </button>

                <button type="button" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-md bg-tw-light-surface/30 hover:bg-tw-surface/60" aria-label="Next image">
                  <ChevronRight />
                </button>

                <div className="p-2 text-center text-xs opacity-80">
                  {index + 1} / {images.length}
                </div>
              </>
            ) : null}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
