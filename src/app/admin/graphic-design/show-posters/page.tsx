"use client";

import AdminPortfolioUpload from "@/app/admin/portfolio/AdminPortfolioUpload";

export default function AdminGraphicLogosPage() {
  return (
    <AdminPortfolioUpload
      presetType="show-posters"
      presetCategory="logos"
      lockType
      lockCategory
      titleOverride="Upload: Graphic Design / Show Posters"
    />
  );
}