"use client";

type AdminPortfolioUploadProps = {
  presetType?: string;
  presetCategory?: string;
  lockType?: boolean;
  lockCategory?: boolean;
  titleOverride?: string;
};

export default function AdminPortfolioUpload({
  presetType,
  presetCategory,
  lockType = false,
  lockCategory = false,
  titleOverride,
}: AdminPortfolioUploadProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 text-white">
      <h1 className="text-2xl font-bold">
        {titleOverride || "Admin Portfolio Upload"}
      </h1>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        <div>
          <span className="text-white/60">presetType:</span>{" "}
          <span className="font-mono">{presetType ?? "(none)"}</span>{" "}
          {lockType ? <span className="ml-2 text-white/50">(locked)</span> : null}
        </div>
        <div className="mt-1">
          <span className="text-white/60">presetCategory:</span>{" "}
          <span className="font-mono">{presetCategory ?? "(none)"}</span>{" "}
          {lockCategory ? (
            <span className="ml-2 text-white/50">(locked)</span>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-white/70">
        This component now accepts preset props so your category pages (events,
        show-posters, etc.) can reuse it. Next step is wiring these values into
        your actual form + Firestore save logic.
      </p>
    </main>
  );
}