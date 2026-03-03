"use client";

import AdminPortfolioUpload from "@/app/admin/portfolio/AdminPortfolioUpload";

export default function AdminGraphicLogosPage() {
  return (
    <AdminPortfolioUpload
      presetType="graphic-design"
      presetCategory="events"
      lockType
      lockCategory
      titleOverride="Upload: Graphic Design / Events"
    />
  );
}