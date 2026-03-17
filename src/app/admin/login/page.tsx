import { Suspense } from "react";
import LoginClient from "./LoginClient";

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
      <main className="min-h-screen bg-neutral-950 p-6 text-white">
        <div className="mx-auto max-w-md pt-16">
          <h1 className="mb-6 text-2xl font-semibold">Admin Login</h1>
          <LoginClient />
        </div>
      </main>
    </Suspense>
  );
}