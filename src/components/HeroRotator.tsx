"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import SignatureDraw from "@/components/SignatureDraw";

export type HeroSlide = {
  src: string;
  alt?: string;
  kicker?: string;
  title?: string;
  blurb?: string;
  signature?: boolean;
};

type Props = {
  slides?: HeroSlide[];
  /** ms */
  intervalMs?: number;
  /** ms */
  fadeMs?: number;
  className?: string;
};

export default function HeroRotator({
  slides = [],
  intervalMs = 9000,
  fadeMs = 1600,
  className = "",
}: Props) {
  const safeSlides = useMemo(() => {
    const arr = Array.isArray(slides) ? slides : [];
    return arr.filter((s): s is HeroSlide => Boolean(s && s.src));
  }, [slides]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx >= safeSlides.length) setIdx(0);
  }, [idx, safeSlides.length]);

  useEffect(() => {
    if (safeSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((n) => (n + 1) % safeSlides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [safeSlides.length, intervalMs]);

  const active = safeSlides[idx];

  return (
    <section
      className={[
        "relative w-full overflow-hidden bg-black",
        "min-h-[calc(100svh-4rem)]",
        className,
      ].join(" ")}
    >
      {/* Background slideshow */}
      <div className="absolute inset-0">
        {safeSlides.length ? (
          safeSlides.map((s, i) => (
            <div
              key={s.src}
              className="absolute inset-0 transition-opacity"
              style={{
                opacity: i === idx ? 1 : 0,
                transitionDuration: `${fadeMs}ms`,
              }}
            >
              <Image
                src={s.src}
                alt={s.alt || "Hero image"}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}

        {/* readability overlays */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/75" />
      </div>

      {/* Content */}
      <div
        className="
          relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl
          flex-col justify-between px-4 pb-8 pt-8 text-center
          sm:px-6 sm:pb-10 sm:pt-10
          md:pt-12
        "
      >
        {/* TOP: blurb */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <div className="mx-auto rounded-2xl border border-white/15 bg-black/35 px-4 py-4 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:px-6 sm:py-5">
              <p className="font-display text-base leading-snug text-white/90 sm:text-xl md:text-3xl">
                {active?.blurb ||
                  "Murals, graphic tees, studio artwork, and creative builds that feel personal to the space."}
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE: name + signature */}
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 sm:py-8">
          {active?.kicker ? (
            <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-white/75 sm:text-xs sm:tracking-[0.35em]">
              {active.kicker}
            </div>
          ) : null}

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl">
            {active?.title || "Joshua Schultz"}
          </h1>

          {active?.signature ? (
            <div className="mt-3 h-12 sm:mt-4 sm:h-14">
              <SignatureDraw className="h-12 w-auto text-white/90 sm:h-14" />
            </div>
          ) : null}
        </div>

        {/* BOTTOM: buttons */}
        <div className="flex justify-center">
          <div className="flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/portfolio"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              View Portfolio
            </Link>

            <Link
              href="/request-meeting"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Request a Meeting
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      {safeSlides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2 sm:bottom-5 sm:right-5 sm:left-auto">
          {safeSlides.map((_, i) => (
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