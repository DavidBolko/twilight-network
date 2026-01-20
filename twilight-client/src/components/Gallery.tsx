import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "./Modal";
import { getFromCdn } from "../utils";

type Props = {
  imageIds: string[];
};

export default function Gallery({ imageIds }: Props) {
  const images = useMemo(() => imageIds.filter(Boolean), [imageIds]);
  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, images.length - 1)));
  }, [images.length]);

  if (!images.length) return null;

  const currentId = images[Math.min(index, images.length - 1)];
  const currentUrl = getFromCdn(currentId);

  const prev = () => setIndex((p) => (p - 1 + images.length) % images.length);
  const next = () => setIndex((p) => (p + 1) % images.length);
  
  return (
    <>
      <div className={`rounded-lg overflow-hidden relative`}>
        <button type="button" className="w-full max-h-[70vh] bg-black/10 dark:bg-white/5" onClick={() => setOpen(true)} aria-label="Open images">
          <img src={currentUrl} alt="Post image" className="w-full h-full object-contain" loading="lazy" />
        </button>

        {images.length > 1 ? (
          <>
            <button type="button" onClick={() => prev()} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-tw-light-surface/30 hover:bg-tw-surface/60 " aria-label="Previous image">
              <ChevronLeft />
            </button>

            <button type="button" onClick={() => next()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-tw-light-surface/30 hover:bg-tw-surface/60" aria-label="Next image">
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
          <div className="relative w-fit mx-auto">
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
