import { Suspense } from "react";
import AdminPortfolioUpload from "@/app/admin/portfolio/AdminPortfolioUpload";

export default function AdminGraphicLogosPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <AdminPortfolioUpload
        presetType="graphic-design"
        presetCategory="events"
        lockType
        lockCategory
        titleOverride="Upload: Graphic Design / Events"
      />
    </Suspense>
  );
}