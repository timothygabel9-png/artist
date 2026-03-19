import { Suspense } from "react";
import AdminPortfolioUpload from "@/components/AdminPortfolioUpload";

export default function AdminGraphicLogosPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading...</div>}>
      <AdminPortfolioUpload
        presetType="graphic-design"
        presetCategory="show-posters"
        lockType
        lockCategory
        titleOverride="Upload: Graphic Design / Show Posters"
      />
    </Suspense>
  );
}