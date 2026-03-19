import { Suspense } from "react";
import AdminPortfolioUploadClient from "./AdminPortfolioUploadClient";

export default function AdminPortfolioUploadPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading uploader...</div>}>
      <AdminPortfolioUploadClient />
    </Suspense>
  );
}