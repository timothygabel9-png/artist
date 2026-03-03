"use client";

import Link from "next/link";

export default function AdminGraphicDesignTshirtsPage() {
  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin: Graphic Design / T-Shirts</h1>
        <Link className="underline" href="/admin/graphic-design">
          Back
        </Link>
      </div>

      <p className="mt-4 text-sm text-gray-700">
        This section is your store products (teeProducts) — it should go to the Tees Admin uploader.
      </p>

      <div className="mt-6">
        <Link
          href="/admin/tees"
          className="inline-block rounded bg-black text-white px-4 py-2"
        >
          Go to Tees Admin (Products / Price / Colors)
        </Link>
      </div>
    </main>
  );
}