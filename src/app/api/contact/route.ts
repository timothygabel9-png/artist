import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email: string) {
  // Simple, practical validation (not perfect, but good enough)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing name, email, or message" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Optional safety limits
    if (name.length > 120) {
      return NextResponse.json(
        { ok: false, error: "Name is too long." },
        { status: 400 }
      );
    }
    if (message.length > 5000) {
      return NextResponse.json(
        { ok: false, error: "Message is too long." },
        { status: 400 }
      );
    }

    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;

    if (!process.env.RESEND_API_KEY || !to || !from) {
      return NextResponse.json(
        { ok: false, error: "Server email env vars not configured" },
        { status: 500 }
      );
    }

    const isMeetingRequest = /^REQUEST MEETING\b/i.test(message);
    const subject = isMeetingRequest
      ? `New Meeting Request — ${name}`
      : `New Message — ${name}`;

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
        <h2 style="margin:0 0 12px 0;">${escapeHtml(subject)}</h2>

        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${safeEmail}</p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />

        <p style="margin:0 0 8px 0;"><strong>Message:</strong></p>
        <div style="white-space:normal;line-height:1.5;">${safeMessage}</div>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />

        <p style="margin:0;color:#6b7280;font-size:12px;">
          Reply directly to this email to respond to ${safeName} (Reply-To is set).
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject,
      text: `Subject: ${subject}\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html,
    });

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}