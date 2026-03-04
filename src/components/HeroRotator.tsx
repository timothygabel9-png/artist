"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import SignatureDraw from "@/components/SignatureDraw";

type HeroImage = {
  src: string;
  alt: string;
};

type Props = {
  images: HeroImage[];
  /** ms */
  intervalMs?: number;
  /** ms */
  fadeMs?: number;
  /** Ken Burns duration ms (should be >= intervalMs for slow movement) */
  kenBurnsMs?: number;
};

export default function HeroRotator({
  images,
  intervalMs = 8000,
  fadeMs = 1600,
  kenBurnsMs = 14000,
}: Props) {
  const safeImages = useMemo(() => (images || []).filter(Boolean), [images]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((n) => (n + 1) % safeImages.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [safeImages.length, intervalMs]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      {/* Image stack (crossfade + Ken Burns) */}
      <div className="absolute inset-0">
        {safeImages.map((img, i) => {
          const active = i === idx;

          // alternate drift direction per slide
          const driftClass = i % 2 === 0 ? "kenburns-a" : "kenburns-b";

          return (
            <div
              key={img.src}
              className="absolute inset-0"
              style={{
                opacity: active ? 1 : 0,
                transition: `opacity ${fadeMs}ms ease-in-out`,
              }}
            >
              {/* Animated inner wrapper so the image can pan/zoom while staying covered */}
              <div
                className={active ? driftClass : ""}
                style={{
                  height: "100%",
                  width: "100%",
                  animationDuration: `${kenBurnsMs}ms`,
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              {/* readability overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/25" />
            </div>
          );
        })}
      </div>

      {/* subtle “bleed” glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -inset-24 bg-white/10 blur-3xl opacity-25" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end">
        <div className="w-full px-6 pb-10 pt-20 sm:px-10 sm:pb-12">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">


              <h1 className="mt-3 text-4xl sm:text-6xl font-semibold tracking-tight text-white">
                Joshua Schultz
              </h1>

              <SignatureDraw className="mt-4 h-14 w-auto text-white/90" />

              <p className="mt-4 max-w-xl text-sm sm:text-base text-white/75">
                Murals, graphic tees, studio artwork, and creative builds — Aurora, IL and beyond.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/portfolio"
                  className="rounded-xl bg-white text-black px-5 py-3 text-sm font-semibold hover:opacity-90 transition"
                >
                  View Portfolio
                </a>
                <a
                  href="/request-meeting"
                  className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  Request a Meeting
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      {safeImages.length > 1 ? (
        <div className="absolute right-5 bottom-5 z-20 flex gap-2">
          {safeImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={[
                "h-2.5 w-2.5 rounded-full border border-white/30 transition",
                i === idx ? "bg-white/90" : "bg-white/10 hover:bg-white/25",
              ].join(" ")}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}