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

const THUMBS_W = 320;

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
  const [isLg, setIsLg] = useState(false);

  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const toggleFullscreen = async () => {
    const el = fullscreenRef.current;
    if (!el) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await el.requestFullscreen();
      }
    } catch {}
  };

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

    if (distance > SWIPE_THRESHOLD) {
      next();
    }

    if (distance < -SWIPE_THRESHOLD) {
      prev();
    }

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

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mq.matches);

    onChange();
    mq.addEventListener?.("change", onChange);

    return () => mq.removeEventListener?.("change", onChange);
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
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAndStop();
      }}
    >
      <div className="h-full w-full p-2 sm:p-4 lg:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          {/* HEADER */}
          <div className="flex flex-col gap-3 border-b border-white/10 px-3 py-3 sm:px-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-white sm:text-lg">
                {title || "Portfolio item"}
              </div>

              {description && (
                <div className="mt-1 line-clamp-2 text-xs text-white/70 sm:text-sm">
                  {description}
                </div>
              )}
            </div>

            <div
              className="flex flex-wrap items-center gap-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Slideshow */}
              <button
                onClick={() => setIsPlaying((p) => !p)}
                disabled={images.length <= 1}
                className="inline-flex min-h-[40px] items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
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
                      Auto Preview
                    </>
                  )}
                </span>
              </button>

              {/* View Project */}
              {id && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(false);
                    onClose();
                    router.push(`/portfolio/item/${id}`);
                  }}
                  className="hidden min-h-[40px] rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 sm:inline-flex"
                >
                  View Project →
                </button>
              )}

              {/* Speed */}
              <select
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                className="hidden min-h-[40px] rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white sm:block"
              >
                <option className="bg-white text-black" value={1500}>
                  Very Fast
                </option>
                <option className="bg-white text-black" value={2500}>
                  Fast
                </option>
                <option className="bg-white text-black" value={5000}>
                  Normal
                </option>
                <option className="bg-white text-black" value={7000}>
                  Slow
                </option>
                <option className="bg-white text-black" value={9000}>
                  Very Slow
                </option>
              </select>

              {/* Close */}
              <button
                onClick={closeAndStop}
                className="inline-flex min-h-[40px] items-center rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>

       {/* IMAGE AREA */}
<div
  ref={fullscreenRef}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
  className="relative flex h-[calc(100%-74px)] items-center justify-center overflow-hidden bg-black sm:h-[calc(100%-76px)] lg:h-[calc(100%-56px)]"
  onDoubleClick={toggleFullscreen}
>
  {current ? (
    <>
{/* blurred background */}
<div
  className="absolute inset-0 animate-[slowZoom_18s_linear_infinite]"
  style={{
    backgroundImage: `url("${current}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    filter: "blur(55px) brightness(0.55)",
  }}
/>

{/* dark overlay so blur stays subtle */}
<div className="absolute inset-0 z-0 bg-black/30" />

{/* main image */}
<div className="relative z-10 flex h-full w-full items-center justify-center px-16 sm:px-20 lg:px-24">
  <img
    src={current}
    alt={title || "Image"}
   className="block max-h-[96%] max-w-[96%] object-contain"
  />
</div>
    </>
  ) : (
    <div className="text-white/40">No images</div>
  )}

  {images.length > 1 && (
    <>
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12 lg:left-6"
        aria-label="Previous image"
      >
        <ChevronLeftIcon className="mx-auto h-5 w-5 text-white sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={next}
        className="absolute right-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12 lg:right-6"
        aria-label="Next image"
      >
        <ChevronRightIcon className="mx-auto h-5 w-5 text-white sm:h-6 sm:w-6" />
      </button>
    </>
  )}

  {/* Mobile image counter */}
  {images.length > 1 && (
    <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white/80 sm:hidden">
      {idx + 1} / {images.length}
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
}