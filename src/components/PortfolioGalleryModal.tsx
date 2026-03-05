"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  id?: string;
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

  const prev = () => setIdx((n) => Math.max(n - 1, 0));
  const next = () => setIdx((n) => Math.min(n + 1, images.length - 1));

  useEffect(() => {
    if (!open) return;
    setIdx(0);
    setIsPlaying(false);
  }, [open]);

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

    const id = setInterval(() => {
      setIdx((n) => (n >= images.length - 1 ? 0 : n + 1));
    }, intervalMs);

    return () => clearInterval(id);
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
      <div className="h-full w-full p-3 sm:p-6">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">

            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-white">
                {title || "Portfolio item"}
              </div>

              {description && (
                <div className="mt-1 line-clamp-2 text-sm text-white/70">
                  {description}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">

              {/* Slideshow */}
              <button
                onClick={() => setIsPlaying((p) => !p)}
                disabled={images.length <= 1}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
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
    onMouseDown={(e) => e.stopPropagation()}
    onClick={(e) => {
      e.stopPropagation();
      setIsPlaying(false);
      onClose(); // close the modal so it doesn't look like nothing happened
      router.push(`/portfolio/item/${id}`);
    }}
    className="relative z-50 hidden sm:inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
  >
    View Project →
  </button>
)}

              {/* Speed */}
              <select
                value={intervalMs}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
                 className="hidden sm:block rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white"
>
  <option className="bg-white text-black" value={1500}>Very Fast</option>
  <option className="bg-white text-black" value={2500}>Fast</option>
  <option className="bg-white text-black" value={3500}>Normal</option>
  <option className="bg-white text-black" value={5000}>Slow</option>
  <option className="bg-white text-black" value={7000}>Very Slow</option>
</select>

              {/* Close */}
              <button
                onClick={closeAndStop}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                Close
              </button>

            </div>
          </div>

          {/* IMAGE AREA */}
          <div
            ref={fullscreenRef}
            className="relative h-[calc(100%-56px)] flex items-center justify-center bg-black cursor-zoom-in"
            onDoubleClick={toggleFullscreen}
            style={{ paddingRight: isLg ? `${THUMBS_W}px` : undefined }}
          >
            {current ? (
              <img
                src={current}
                alt={title || "Image"}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-white/40">No images</div>
            )}

            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10"
                >
                  <ChevronLeftIcon className="h-6 w-6 mx-auto text-white" />
                </button>

                <button
                  onClick={next}
                  className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10"
                >
                  <ChevronRightIcon className="h-6 w-6 mx-auto text-white" />
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}