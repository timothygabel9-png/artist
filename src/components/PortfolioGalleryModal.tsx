"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  id?: string;
  title?: string;
  description?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  initialIndex?: number;
};

function uniq(arr: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const x = (s || "").trim();
    if (!x) continue;
    if (seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14.5 5.5L8.5 12l6 6.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M9.5 5.5L15.5 12l-6 6.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9.5 7.5v9l8-4.5-8-4.5z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M8 7h3v10H8V7zm5 0h3v10h-3V7z" fill="currentColor" />
    </svg>
  );
}

export default function PortfolioGalleryModal({
  open,
  onClose,
  id,
  title,
  description,
  coverImageUrl,
  imageUrls,
  initialIndex = 0,
}: Props) {
  const router = useRouter();

  const images = useMemo(() => {
    const merged = [coverImageUrl, ...(imageUrls || [])].filter(Boolean) as string[];
    return uniq(merged);
  }, [coverImageUrl, imageUrls]);

  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(3500);

  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

const toggleFullscreen = async () => {
  const el = fullscreenRef.current;
  if (!el) return;

  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      closeAndStop(); // return to thumbnails after exiting fullscreen
    } else {
      await el.requestFullscreen();
    }
  } catch {}
};

  const closeAndStop = () => {
    setIsPlaying(false);
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    onClose();
  };

  const prev = () => {
    setIsPlaying(false);
    setIdx((n) => (n === 0 ? images.length - 1 : n - 1));
  };

  const next = () => {
    setIsPlaying(false);
    setIdx((n) => (n >= images.length - 1 ? 0 : n + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const SWIPE_THRESHOLD = 50;

    if (distance > SWIPE_THRESHOLD) next();
    if (distance < -SWIPE_THRESHOLD) prev();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    if (!open) return;
    const safeIndex =
      initialIndex >= 0 && initialIndex < images.length ? initialIndex : 0;
    setIdx(safeIndex);
    setIsPlaying(false);
  }, [open, initialIndex, images.length]);

  useEffect(() => {
    if (!open) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !isPlaying || images.length <= 1) return;

    const timerId = setInterval(() => {
      setIdx((n) => (n >= images.length - 1 ? 0 : n + 1));
    }, intervalMs);

    return () => clearInterval(timerId);
  }, [open, isPlaying, images.length, intervalMs]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndStop();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  if (!open) return null;

  const current = images[idx];

return (
  <div
    className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) closeAndStop();
    }}
  >
    {/* Full-frame viewer */}
    <div
      ref={fullscreenRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={toggleFullscreen}
      className="absolute inset-0 overflow-hidden"
    >
      {current ? (
        <>
          {/* blurred background */}
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url("${current}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "blur(55px) brightness(0.45)",
              transform: "scale(1.15)",
            }}
          />
          <div className="absolute inset-0 z-0 bg-black/35" />

          {/* main image */}
          <div className="relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-6">
            <img
              src={current}
              alt={title || "Image"}
              className="block max-h-[92dvh] max-w-[96vw] object-contain"
            />
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center text-white/40">
          No images
        </div>
      )}

      {/* top overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/70 via-black/35 to-transparent px-4 py-4 sm:px-6">
        <div className="pr-24 sm:pr-40">
          <div className="truncate text-base font-semibold text-white sm:text-lg">
            {title || "Portfolio item"}
          </div>
          {description ? (
            <div className="mt-1 line-clamp-2 text-xs text-white/75 sm:text-sm">
              {description}
            </div>
          ) : null}
        </div>
      </div>

      {/* floating controls */}
      <div className="absolute right-3 top-3 z-30 flex items-center gap-2 sm:right-4 sm:top-4">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          disabled={images.length <= 1}
          className="hidden min-h-[40px] rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-sm text-white backdrop-blur hover:bg-black/60 disabled:opacity-50 sm:inline-flex sm:items-center"
        >
          <span className="flex items-center gap-2">
            {isPlaying ? (
              <>
                <PauseIcon className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4" />
                Auto
              </>
            )}
          </span>
        </button>

        {id && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(false);
              onClose();
              router.push(`/portfolio/item/${id}`);
            }}
            className="hidden min-h-[40px] rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-sm text-white backdrop-blur hover:bg-black/60 sm:inline-flex sm:items-center"
          >
            View Project
          </button>
        )}

        <select
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value))}
          className="hidden min-h-[40px] rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-sm text-white backdrop-blur sm:block"
        >
          <option className="bg-white text-black" value={1500}>Very Fast</option>
          <option className="bg-white text-black" value={2500}>Fast</option>
          <option className="bg-white text-black" value={3500}>Normal</option>
          <option className="bg-white text-black" value={5000}>Slow</option>
          <option className="bg-white text-black" value={7000}>Very Slow</option>
        </select>

        <button
          onClick={closeAndStop}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-xl text-white backdrop-blur hover:bg-black/70"
          aria-label="Close slideshow"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60 sm:flex"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60 sm:flex"
            aria-label="Next image"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* mobile counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs text-white/85 backdrop-blur sm:hidden">
          {idx + 1} / {images.length}
        </div>
      )}
    </div>
  </div>
);
}