"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const closeAndStop = () => {
    setIsPlaying(false);
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

  const toggleFullscreen = async () => {
    const el = fullscreenRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {
      // ignore fullscreen errors
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;

    const distance = touchStartX.current - touchEndX.current;
    const SWIPE_THRESHOLD = 40;

    if (distance > SWIPE_THRESHOLD) {
      next();
    } else if (distance < -SWIPE_THRESHOLD) {
      prev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

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
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
          return;
        }
        closeAndStop();
      }

      if (e.key === "ArrowRight" && images.length > 1) next();
      if (e.key === "ArrowLeft" && images.length > 1) prev();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  useEffect(() => {
    if (!open && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [open]);

  if (!open || !mounted) return null;

  const current = images[idx];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/88 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAndStop();
      }}
    >
      <div
        ref={fullscreenRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={toggleFullscreen}
        className="absolute inset-0 overflow-auto overscroll-contain"
      >
        {current ? (
          <>
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url("${current}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                filter: 'blur(55px) brightness(0.45)',
                transform: "scale(1.15)",
              }}
            />
            <div className="absolute inset-0 z-0 bg-black/45" />

            <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-3 py-20 sm:px-6 sm:py-24">
              <div key={current} className="animate-[fadeIn_.45s_ease-out]">
                <img
                  src={current}
                  alt={title || "Image"}
                  className="block h-auto max-h-[88vh] w-auto max-w-full select-none object-contain transition-all duration-500 ease-out"
                  draggable={false}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-screen items-center justify-center text-white/40">
            No images
          </div>
        )}

<div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4 sm:top-4 sm:px-6">
  <div className="w-full max-w-2xl text-center">
    <div className="px-5 py-2">
      <div className="text-lg font-semibold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-xl">
        {title || "Portfolio item"}
      </div>
      {description ? (
        <div className="mt-1 text-sm text-white/80 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-base">
          {description}
        </div>
      ) : null}
    </div>
  </div>
</div>

        <div className="absolute right-3 top-3 z-30 flex items-center gap-2 sm:right-4 sm:top-4">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            disabled={images.length <= 1}
            className="inline-flex min-h-[40px] items-center rounded-lg border border-white/10 bg-black/55 px-3 py-2 text-sm text-white backdrop-blur hover:bg-black/70 disabled:opacity-50"
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

          <select
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="min-h-[40px] rounded-lg border border-white/10 bg-black/55 px-2 py-2 text-sm text-white backdrop-blur hover:bg-black/70"
            aria-label="Slideshow speed"
          >
            <option className="bg-white text-black" value={3000}>
              Fast
            </option>
            <option className="bg-white text-black" value={4000}>
              Medium
            </option>
            <option className="bg-white text-black" value={6000}>
              Normal
            </option>
            <option className="bg-white text-black" value={8000}>
              Slow
            </option>
            <option className="bg-white text-black" value={10000}>
              Very Slow
            </option>
          </select>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden min-h-[40px] items-center rounded-lg border border-white/10 bg-black/55 px-3 py-2 text-sm text-white backdrop-blur hover:bg-black/70 sm:inline-flex"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
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
              className="hidden min-h-[40px] items-center rounded-lg border border-white/10 bg-black/55 px-3 py-2 text-sm text-white backdrop-blur hover:bg-black/70 sm:inline-flex"
            >
              View Project
            </button>
          )}

          <button
            type="button"
            onClick={closeAndStop}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/55 text-xl text-white backdrop-blur hover:bg-black/70"
            aria-label="Close slideshow"
            title="Close"
          >
            ×
          </button>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/70 sm:left-6 sm:h-14 sm:w-14"
              aria-label="Previous image"
              type="button"
            >
              <ChevronLeftIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>

            <button
              onClick={next}
              className="absolute right-4 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition hover:scale-105 hover:bg-black/70 sm:right-6 sm:h-14 sm:w-14"
              aria-label="Next image"
              type="button"
            >
              <ChevronRightIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-xs text-white/85 backdrop-blur sm:hidden">
            {idx + 1} / {images.length}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}