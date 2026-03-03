"use client";

import AdminPortfolioUpload from "@/components/AdminPortfolioUpload";

export default function AdminGraphicLogosPage() {
  return (
    <AdminPortfolioUpload
      presetType="graphic-design"
      presetCategory="logos"
      lockType
      lockCategory
      titleOverride="Upload: Graphic Design / Logos"
    />
  );
}