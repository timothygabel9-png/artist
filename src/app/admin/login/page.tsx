import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export const metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-950 p-6 text-white">
          <div className="mx-auto max-w-md pt-16">Loading...</div>
        </main>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}