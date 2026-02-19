import Link from "next/link";

type Variant =
  | "roseSky"
  | "amberIndigo"
  | "mintLavender"
  | "neutral"
  // darker / moodier
  | "midnightIndigo"
  | "deepRoseNoir"
  | "forestStudio"
  | "auroraNight"
  | "charcoal";

const variants: Record<Variant, { base: string; blobs: string }> = {
  // --- LIGHT THEMES ---
  roseSky: {
    base: "bg-gradient-to-br from-rose-100 via-white to-sky-100",
    blobs:
      // "paint swirls" + soft blobs
      "opacity-60 [background:" +
      "radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.20),transparent_48%)," +
      "radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.18),transparent_50%)," +
      "radial-gradient(circle_at_40%_90%,rgba(34,197,94,0.12),transparent_55%)," +
      "conic-gradient(from_220deg_at_60%_30%,rgba(236,72,153,0.10),rgba(59,130,246,0.10),rgba(34,197,94,0.08),rgba(236,72,153,0.10))" +
      "]",
  },

  amberIndigo: {
    base: "bg-gradient-to-br from-amber-100 via-white to-indigo-100",
    blobs:
      "opacity-55 [background:" +
      "radial-gradient(circle_at_15%_20%,rgba(99,102,241,0.18),transparent_48%)," +
      "radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.16),transparent_50%)," +
      "radial-gradient(circle_at_50%_95%,rgba(236,72,153,0.12),transparent_55%)," +
      "conic-gradient(from_200deg_at_55%_35%,rgba(245,158,11,0.10),rgba(99,102,241,0.10),rgba(236,72,153,0.08),rgba(245,158,11,0.10))" +
      "]",
  },

  mintLavender: {
    base: "bg-gradient-to-br from-emerald-100 via-white to-violet-100",
    blobs:
      "opacity-55 [background:" +
      "radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.16),transparent_48%)," +
      "radial-gradient(circle_at_82%_22%,rgba(139,92,246,0.16),transparent_50%)," +
      "radial-gradient(circle_at_50%_92%,rgba(59,130,246,0.12),transparent_55%)," +
      "conic-gradient(from_240deg_at_52%_32%,rgba(16,185,129,0.10),rgba(139,92,246,0.10),rgba(59,130,246,0.08),rgba(16,185,129,0.10))" +
      "]",
  },

  neutral: {
    base: "bg-gradient-to-br from-zinc-50 via-white to-zinc-100",
    blobs:
      "opacity-35 [background:" +
      "radial-gradient(circle_at_25%_20%,rgba(0,0,0,0.07),transparent_50%)," +
      "radial-gradient(circle_at_75%_20%,rgba(0,0,0,0.05),transparent_55%)," +
      "conic-gradient(from_180deg_at_55%_35%,rgba(0,0,0,0.03),rgba(0,0,0,0.02),rgba(0,0,0,0.03))" +
      "]",
  },

  // --- DARK THEMES ---
  midnightIndigo: {
    base: "bg-gradient-to-br from-indigo-950 via-slate-900 to-black",
    blobs:
      "opacity-45 [background:" +
      "radial-gradient(circle_at_20%_15%,rgba(99,102,241,0.38),transparent_52%)," +
      "radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.28),transparent_56%)," +
      "radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.26),transparent_58%)," +
      "conic-gradient(from_210deg_at_58%_32%,rgba(99,102,241,0.22),rgba(236,72,153,0.18),rgba(14,165,233,0.16),rgba(99,102,241,0.22))" +
      "]",
  },

  deepRoseNoir: {
    base: "bg-gradient-to-br from-rose-950 via-neutral-900 to-black",
    blobs:
      "opacity-48 [background:" +
      "radial-gradient(circle_at_25%_15%,rgba(244,63,94,0.40),transparent_52%)," +
      "radial-gradient(circle_at_75%_25%,rgba(251,113,133,0.26),transparent_58%)," +
      "radial-gradient(circle_at_50%_85%,rgba(168,85,247,0.28),transparent_62%)," +
      "conic-gradient(from_235deg_at_55%_35%,rgba(244,63,94,0.22),rgba(168,85,247,0.18),rgba(251,113,133,0.14),rgba(244,63,94,0.22))" +
      "]",
  },

  forestStudio: {
    base: "bg-gradient-to-br from-emerald-950 via-neutral-900 to-black",
    blobs:
      "opacity-44 [background:" +
      "radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.38),transparent_52%)," +
      "radial-gradient(circle_at_80%_25%,rgba(34,197,94,0.26),transparent_58%)," +
      "radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.20),transparent_62%)," +
      "conic-gradient(from_210deg_at_52%_34%,rgba(16,185,129,0.20),rgba(34,197,94,0.16),rgba(59,130,246,0.12),rgba(16,185,129,0.20))" +
      "]",
  },

  auroraNight: {
    base: "bg-gradient-to-br from-slate-950 via-indigo-950 to-black",
    blobs:
      "opacity-48 [background:" +
      "radial-gradient(circle_at_15%_15%,rgba(56,189,248,0.38),transparent_52%)," +
      "radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.30),transparent_58%)," +
      "radial-gradient(circle_at_50%_90%,rgba(236,72,153,0.24),transparent_62%)," +
      "conic-gradient(from_200deg_at_58%_30%,rgba(56,189,248,0.20),rgba(168,85,247,0.18),rgba(236,72,153,0.14),rgba(56,189,248,0.20))" +
      "]",
  },

  charcoal: {
    base: "bg-gradient-to-br from-neutral-900 via-zinc-900 to-black",
    blobs:
      "opacity-30 [background:" +
      "radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.10),transparent_55%)," +
      "radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.06),transparent_60%)," +
      "conic-gradient(from_180deg_at_55%_35%,rgba(255,255,255,0.05),rgba(255,255,255,0.03),rgba(255,255,255,0.05))" +
      "]",
  },
};

export default function SoftPageShell({
  title,
  subtitle,
  variant = "roseSky",
  maxWidth = "max-w-6xl",
  showHomeLink = true,
  children,
}: {
  title: string;
  subtitle?: string;
  variant?: Variant;
  maxWidth?: string;
  showHomeLink?: boolean;
  children: React.ReactNode;
}) {
  const v = variants[variant];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* background layers */}
      <div className={`absolute inset-0 z-0 ${v.base}`} />
      <div className={`absolute inset-0 z-0 ${v.blobs}`} />

      {/* content */}
      <div className={`relative z-10 mx-auto ${maxWidth} px-6 py-10`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-2 text-gray-700">{subtitle}</p> : null}
          </div>

          {showHomeLink ? (
            <Link href="/" className="text-sm underline text-gray-700 hover:text-black">
              Home
            </Link>
          ) : null}
        </div>

        <div className="mt-8 rounded-2xl border border-black/5 bg-white/70 backdrop-blur shadow-sm p-6 md:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
