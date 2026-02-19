import type { Handler } from "@netlify/functions";
import nodemailer from "nodemailer";

function required(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body || "{}");

    const {
      firstName,
      lastName,
      email,
      phone,
      businessName,
      addressLine1,
      city,
      state,
      zip,
      preferredDate,
      preferredTime,
      comments,
      photoUrl,
    } = body ?? {};

    if (
      !required(firstName) ||
      !required(lastName) ||
      !required(email) ||
      !required(phone) ||
      !required(addressLine1) ||
      !required(city) ||
      !required(state) ||
      !required(zip) ||
      !required(preferredDate) ||
      !required(preferredTime)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Missing required fields." }),
        headers: { "Content-Type": "application/json" },
      };
    }

    if (typeof comments === "string" && comments.length > 500) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Comments must be 500 characters or less." }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT || "465"),
      secure: String(process.env.SMTP_SECURE || "true") === "true",
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    const to = process.env.MEETING_TO_EMAIL || "timothy.gabel9@gmail.com";

    const subject = `CreativeEdge Meeting Request: ${firstName} ${lastName}`;
    const text =
`New meeting request

Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Business Name: ${businessName || "(none)"}

Address:
${addressLine1}
${city}, ${state} ${zip}

Preferred:
${preferredDate} at ${preferredTime}

Comments:
${comments || "(none)"}

Photo:
${photoUrl || "(none)"}
`;

    await transporter.sendMail({
      from: `CreativeEdge <${process.env.SMTP_USER!}>`,
      to,
      replyTo: email,
      subject,
      text,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: err?.message || "Server error" }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
