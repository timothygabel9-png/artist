"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import SignatureDraw from "@/components/SignatureDraw";

export type HeroSlide = {
  src: string;
  alt?: string;
  kicker?: string;  // small line above title
  title?: string;   // main title (Joshua Schultz)
  blurb?: string;   // the artistic blurb
  signature?: boolean;
};

type Props = {
  slides?: HeroSlide[];
  /** ms */
  intervalMs?: number;
  /** ms */
  fadeMs?: number;
};

export default function HeroRotator({
  slides = [],
  intervalMs = 9000,
  fadeMs = 1600,
}: Props) {
  const safeSlides = useMemo(() => {
    const arr = Array.isArray(slides) ? slides : [];
    return arr.filter((s): s is HeroSlide => Boolean(s && s.src));
  }, [slides]);

  const [idx, setIdx] = useState(0);

  // keep idx valid when slide list changes
  useEffect(() => {
    if (idx >= safeSlides.length) setIdx(0);
  }, [idx, safeSlides.length]);

  // auto-rotate
  useEffect(() => {
    if (safeSlides.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((n) => (n + 1) % safeSlides.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [safeSlides.length, intervalMs]);

  const active = safeSlides[idx];

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-black">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
      </div>

      {/* Content: fixed zones so nothing overlaps */}
      <div className="relative z-10 mx-auto grid h-[100svh] max-w-5xl px-6 pt-20 pb-10 text-center">
        {/* TOP: blurb */}
        <div className="flex items-start justify-center">
          <div className="w-full max-w-3xl">
            <div className="mx-auto rounded-2xl border border-white/15 bg-black/35 px-6 py-5 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
              <p className="font-display text-lg sm:text-2xl md:text-3xl leading-snug text-white/90">
                {active?.blurb ||
                  "Murals, graphic tees, studio artwork, and creative builds that feel personal to the space."}
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE: name + signature */}
        <div className="flex flex-col items-center justify-center">
          {active?.kicker ? (
            <div className="mb-3 text-xs uppercase tracking-[0.35em] text-white/75">
              {active.kicker}
            </div>
          ) : null}

          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white">
            {active?.title || "Joshua Schultz"}
          </h1>

          {active?.signature ? (
            <div className="mt-4 h-14">
              <SignatureDraw className="h-14 w-auto text-white/90" />
            </div>
          ) : null}
        </div>

        {/* BOTTOM: buttons */}
        <div className="flex items-end justify-center">
          <div className="flex flex-wrap justify-center gap-3">
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

      {/* Dots */}
      {safeSlides.length > 1 ? (
        <div className="absolute right-5 bottom-5 z-20 flex gap-2">
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