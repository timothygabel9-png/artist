"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M9.5 7.5v9l8-4.5-8-4.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M8 7h3v10H8V7zm5 0h3v10h-3V7z" fill="currentColor" />
    </svg>
  );
}

const THUMBS_W = 320; // px (match w-[320px] below)

export default function PortfolioGalleryModal({
  open,
  onClose,
  title,
  description,
  coverImageUrl,
  imageUrls,
}: Props) {
  const images = useMemo(() => {
    const merged = [coverImageUrl, ...(imageUrls || [])].filter(Boolean) as string[];
    return uniq(merged);
  }, [coverImageUrl, imageUrls]);

  const [idx, setIdx] = useState(0);

  // slideshow
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(3500);

  // viewport (avoid using window in render logic directly)
  const [isLg, setIsLg] = useState(false);

  // swipe refs
  const pointerActiveRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const deltaXRef = useRef(0);
  const deltaYRef = useRef(0);

  // Fullscreen target (image stage)
  const fullscreenRef = useRef<HTMLDivElement | null>(null);

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
      // ignore
    }
  };

  const closeAndStop = () => {
    setIsPlaying(false);
    onClose();
  };

  const prev = () => setIdx((n) => Math.max(n - 1, 0));
  const next = () => setIdx((n) => Math.min(n + 1, images.length - 1));

  // reset index when opening
  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setIsPlaying(false);
  }, [open, images.length]);

  // lock background scroll when modal open
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // detect lg breakpoint
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // keyboard controls
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAndStop();

      if (e.key === "ArrowRight") {
        setIsPlaying(false);
        setIdx((n) => Math.min(n + 1, images.length - 1));
      }
      if (e.key === "ArrowLeft") {
        setIsPlaying(false);
        setIdx((n) => Math.max(n - 1, 0));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  // slideshow (loops forever)
  useEffect(() => {
    if (!open) return;
    if (!isPlaying) return;
    if (images.length <= 1) return;

    const id = window.setInterval(() => {
      setIdx((n) => (n >= images.length - 1 ? 0 : n + 1));
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [open, isPlaying, images.length, intervalMs]);

  if (!open) return null;

  const current = images[idx];
  const canPrev = idx > 0;
  const canNext = idx < images.length - 1;

  const leftArrowClass = [
    "group absolute left-6 top-1/2 -translate-y-1/2",
    "h-12 w-12 rounded-full",
    "border border-white/20",
    "bg-white/10 backdrop-blur-xl",
    "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
    "transition-all duration-200",
    "hover:bg-white/20 hover:border-white/30 hover:scale-[1.03]",
    "active:scale-[0.98]",
    "disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:scale-100",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
  ].join(" ");

  const rightArrowClass = [
    "group absolute top-1/2 -translate-y-1/2",
    "h-12 w-12 rounded-full",
    "border border-white/20",
    "bg-white/10 backdrop-blur-xl",
    "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
    "transition-all duration-200",
    "hover:bg-white/20 hover:border-white/30 hover:scale-[1.03]",
    "active:scale-[0.98]",
    "disabled:opacity-30 disabled:hover:bg-white/10 disabled:hover:scale-100",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
  ].join(" ");

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeAndStop();
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* FULL SCREEN WRAPPER */}
      <div className="h-full w-full p-3 sm:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-white">
                {title || "Portfolio item"}
              </div>
              {description ? (
                <div className="mt-1 line-clamp-2 text-sm text-white/70">
                  {description}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {/* Auto Preview */}
              <button
                onClick={() => setIsPlaying((p) => !p)}
                disabled={images.length <= 1}
                className={[
                  "shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10",
                  "disabled:opacity-40 disabled:hover:bg-white/5",
                ].join(" ")}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                title={images.length <= 1 ? "Add more images to use slideshow" : ""}
              >
                <span className="inline-flex items-center gap-2">
                  {isPlaying ? (
                    <>
                      <PauseIcon className="h-4 w-4 text-white/90" />
                      Pause
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 text-white/90" />
                      Auto Preview
                    </>
                  )}
                </span>
              </button>

              {/* Speed */}
<select
  value={intervalMs}
  onChange={(e) => setIntervalMs(Number(e.target.value))}
  className="hidden sm:block shrink-0 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
  title="Slideshow speed"
  aria-label="Slideshow speed"
  disabled={images.length <= 1}
  style={{
    color: "white",
    backgroundColor: "rgba(255,255,255,0.08)",
  }}
>
  <option value={1500} style={{ color: "black" }}>Very Fast</option>
  <option value={2500} style={{ color: "black" }}>Fast</option>
  <option value={3500} style={{ color: "black" }}>Normal</option>
  <option value={5000} style={{ color: "black" }}>Slow</option>
  <option value={7000} style={{ color: "black" }}>Very Slow</option>
</select>

              <button
                onClick={closeAndStop}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>

          {/* body (fills remaining height) */}
          <div className="relative h-[calc(100%-56px)] bg-black">
            {/* IMAGE STAGE (pad right on lg so it's not under thumbs) */}
            <div
              ref={fullscreenRef}
              className="relative h-full w-full cursor-zoom-in flex items-center justify-center touch-pan-y"
              onDoubleClick={toggleFullscreen}
              title="Double-click to fullscreen"
              style={{
                paddingRight: isLg ? `${THUMBS_W}px` : undefined,
              }}
              onPointerDown={(e) => {
                // only primary
                if ((e as any).button !== undefined && (e as any).button !== 0) return;

                pointerActiveRef.current = true;
                startXRef.current = e.clientX;
                startYRef.current = e.clientY;
                deltaXRef.current = 0;
                deltaYRef.current = 0;

                try {
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
              }}
              onPointerMove={(e) => {
                if (!pointerActiveRef.current) return;
                deltaXRef.current = e.clientX - startXRef.current;
                deltaYRef.current = e.clientY - startYRef.current;
              }}
              onPointerUp={() => {
                if (!pointerActiveRef.current) return;
                pointerActiveRef.current = false;

                const dx = deltaXRef.current;
                const dy = deltaYRef.current;

                // ignore mostly-vertical gestures (scroll)
                if (Math.abs(dy) > Math.abs(dx)) return;

                const threshold = 60;
                if (dx > threshold) {
                  setIsPlaying(false);
                  prev();
                } else if (dx < -threshold) {
                  setIsPlaying(false);
                  next();
                }
              }}
            >
              {current ? (
                <img
                  src={current}
                  alt={title || "Image"}
                  className="max-h-full max-w-full object-contain object-center select-none"
                  draggable={false}
                />
              ) : (
                <div className="text-white/40">No images</div>
              )}
            </div>

            {/* LEFT ARROW */}
            {images.length > 1 ? (
              <button
                onClick={() => {
                  setIsPlaying(false);
                  prev();
                }}
                disabled={!canPrev}
                aria-label="Previous image"
                className={leftArrowClass}
              >
                <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
                <ChevronLeftIcon className="mx-auto h-6 w-6 text-white/95 drop-shadow-sm transition-transform duration-200 group-hover:-translate-x-[1px]" />
              </button>
            ) : null}

            {/* RIGHT ARROW — positioned left of thumbs column on lg */}
            {images.length > 1 ? (
              <button
                onClick={() => {
                  setIsPlaying(false);
                  next();
                }}
                disabled={!canNext}
                aria-label="Next image"
                style={{
                  right: isLg ? `${THUMBS_W + 24}px` : "24px",
                }}
                className={rightArrowClass}
              >
                <span className="absolute inset-0 rounded-full ring-1 ring-white/10" />
                <ChevronRightIcon className="mx-auto h-6 w-6 text-white/95 drop-shadow-sm transition-transform duration-200 group-hover:translate-x-[1px]" />
              </button>
            ) : null}

            {/* COUNTER */}
            {images.length > 1 ? (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs text-white/80">
                {idx + 1} / {images.length}
              </div>
            ) : null}

            {/* THUMBNAILS RIGHT (pinned, full height) */}
            {images.length > 0 ? (
              <aside className="hidden lg:block absolute right-0 top-0 h-full w-[320px] bg-zinc-950/95 border-l border-white/10 p-3 overflow-y-auto">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-3">
                  Photos
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {images.map((url, i) => (
                    <button
                      key={url + i}
                      onClick={() => {
                        setIsPlaying(false);
                        setIdx(i);
                      }}
                      className={[
                        "relative overflow-hidden rounded-xl border",
                        i === idx
                          ? "border-white/40"
                          : "border-white/10 hover:border-white/25",
                      ].join(" ")}
                      aria-label={`Open image ${i + 1}`}
                    >
                      <div className="relative aspect-square w-full bg-black">
                        <Image
                          src={url}
                          alt={`Thumbnail ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 text-xs text-white/50">
                  Tip: Swipe left/right on the image, ← / → to navigate, Esc to close.
                </div>
              </aside>
            ) : null}

            {/* MOBILE TIP */}
            <div className="lg:hidden absolute bottom-3 right-3 text-xs text-white/50 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
              Swipe • Double-click fullscreen • Auto Preview in header
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}