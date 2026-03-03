"use client";

import AdminPortfolioUpload from "@/components/AdminPortfolioUpload";

export default function AdminGraphicLogosPage() {
  return (
    <AdminPortfolioUpload
      presetType="graphic-design"
      presetCategory="album-covers"
      lockType
      lockCategory
      titleOverride="Upload: Graphic Design / Album Covers"
    />
  );
}