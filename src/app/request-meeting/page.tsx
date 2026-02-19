"use client";

import { useMemo, useState } from "react";
import { uploadFile } from "@/lib/upload";
import SoftPageShell from "@/components/SoftPageShell";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName: string;
  addressLine1: string;
  city: string;
  state: string;
  zip: string;
  preferredDate: string;
  preferredTime: string;
  comments: string;
};

const initial: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  businessName: "",
  addressLine1: "",
  city: "",
  state: "",
  zip: "",
  preferredDate: "",
  preferredTime: "",
  comments: "",
};

const MAX_PHOTO_MB = 5;

export default function RequestMeetingPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [photo, setPhoto] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const remaining = useMemo(() => 500 - form.comments.length, [form.comments]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    const required: (keyof FormState)[] = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "addressLine1",
      "city",
      "state",
      "zip",
      "preferredDate",
      "preferredTime",
    ];

    for (const k of required) {
      if (!form[k].trim()) {
        setStatus("Please fill out all required fields.");
        return;
      }
    }

    if (form.comments.length > 500) {
      setStatus("Comments must be 500 characters or less.");
      return;
    }

    setBusy(true);
    try {
      let photoUrl = "";

      if (photo) {
        if (photo.size > MAX_PHOTO_MB * 1024 * 1024) {
          setStatus(`Photo must be under ${MAX_PHOTO_MB}MB.`);
          return;
        }

        const safeName = photo.name.replace(/[^\w.\-]+/g, "_");
        const path = `meetingRequests/${Date.now()}_${safeName}`;
        setStatus("Uploading photo…");
        photoUrl = await uploadFile(photo, path);
      }

      setStatus("Sending request…");
      const res = await fetch("/.netlify/functions/request-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photoUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Failed to send request.");
      }

      setStatus("✅ Request sent! We’ll reach out soon.");
      setForm(initial);
      setPhoto(null);
    } catch (err: any) {
      console.error(err);
      setStatus(err?.message || "Failed to send request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SoftPageShell
      title="Request a Meeting"
      subtitle="Share a few details and your preferred time — we’ll follow up to confirm."
      variant="amberIndigo"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <SectionTitle>Contact</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="First name *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
            />
          </Field>

          <Field label="Last name *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
            />
          </Field>

          <Field label="Email *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>

          <Field label="Phone *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>

          <Field label="Business name (optional)">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
            />
          </Field>
        </div>

        <SectionTitle>Location</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Address line *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.addressLine1}
              onChange={(e) => set("addressLine1", e.target.value)}
            />
          </Field>

          <Field label="City *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>

          <Field label="State *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
            />
          </Field>

          <Field label="Zip *">
            <input
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.zip}
              onChange={(e) => set("zip", e.target.value)}
            />
          </Field>
        </div>

        <SectionTitle>Preferred time</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Preferred date *">
            <input
              type="date"
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.preferredDate}
              onChange={(e) => set("preferredDate", e.target.value)}
            />
          </Field>

          <Field label="Preferred time *">
            <input
              type="time"
              className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 outline-none focus:ring-2 focus:ring-black/10"
              value={form.preferredTime}
              onChange={(e) => set("preferredTime", e.target.value)}
            />
          </Field>
        </div>

        <SectionTitle>Project details</SectionTitle>

        <div>
          <label className="block text-sm mb-1 text-gray-800">Comments (max 500)</label>
          <textarea
            className="w-full rounded-lg border border-black/10 bg-white/80 p-2.5 min-h-[140px] outline-none focus:ring-2 focus:ring-black/10"
            value={form.comments}
            maxLength={500}
            onChange={(e) => set("comments", e.target.value)}
            placeholder="Tell us what you’re looking for…"
          />
          <p className={`text-xs mt-1 ${remaining < 0 ? "text-red-600" : "text-gray-600"}`}>
            {remaining} characters remaining
          </p>
        </div>

        <div>
          <label className="block text-sm mb-2 text-gray-800">Upload a photo (optional)</label>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="inline-block cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90">
              Browse Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (!f) return;

                  if (f.size > MAX_PHOTO_MB * 1024 * 1024) {
                    setStatus(`Photo must be under ${MAX_PHOTO_MB}MB.`);
                    return;
                  }
                  setPhoto(f);
                }}
              />
            </label>

            {photo ? (
              <button
                type="button"
                className="rounded-md border border-black/10 bg-white/70 px-3 py-2 text-sm hover:bg-black/5"
                onClick={() => setPhoto(null)}
              >
                Remove
              </button>
            ) : null}
          </div>

          {photo ? (
            <p className="text-xs text-gray-600 mt-2">
              Selected: {photo.name} ({Math.round(photo.size / 1024)} KB)
            </p>
          ) : (
            <p className="text-xs text-gray-600 mt-2">No photo selected.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send Request"}
        </button>

        {status && <p className="text-sm mt-2">{status}</p>}

        <p className="pt-2 text-xs text-gray-600">
          Prefer email? Send details to{" "}
          <span className="font-medium">timothy.gabel9@gmail.com</span>.
        </p>
      </form>
    </SoftPageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-800">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-2 text-xs font-semibold tracking-widest uppercase text-gray-600">{children}</h2>;
}
