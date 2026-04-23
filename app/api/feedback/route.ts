import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { Resend } from "resend";
import {
  checkFeedbackRateLimit,
  escapeHtml,
  getClientIp,
  honeypotTripped,
  isBotUserAgent,
  maskWallet,
  MIN_DESCRIPTION_CHARS,
  MIN_SUBMIT_DELTA_MS,
} from "@/lib/feedbackSecurity";
import { notifyBugTelegram } from "@/lib/feedbackTelegram";

export const dynamic = "force-dynamic";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DESCRIPTION_CHARS = 20_000;

function safeText(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}
function isDisallowedImage(file: File): boolean {
  const name = file.name?.toLowerCase() ?? "";
  if (name.endsWith(".svg") || name.endsWith(".svgz")) return true;
  const t = file.type?.toLowerCase() ?? "";
  if (t === "image/svg+xml") return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limited = checkFeedbackRateLimit(ip);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many reports. Please try again later.", retryAfterSec: limited.retryAfterSec },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const uaHeader = req.headers.get("user-agent");
    if (isBotUserAgent(uaHeader)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const blobTokenRaw = process.env.BLOB_READ_WRITE_TOKEN?.trim() ?? "";
    const blobToken = blobTokenRaw.length > 0 ? blobTokenRaw : null;
    const resend = getResend();
    const fromEmail =
      process.env.RESEND_FROM_EMAIL?.trim() || "feedback@novex.finance";

    const form = await req.formData();
    const description = safeText(form.get("description"));
    const wallet = safeText(form.get("wallet"));
    const screenshot = form.get("screenshot");

    if (honeypotTripped(safeText(form.get("website")))) {
      return NextResponse.json({ ok: true });
    }

    const deltaMs = Number(safeText(form.get("_t")));
    if (!Number.isFinite(deltaMs) || deltaMs < MIN_SUBMIT_DELTA_MS) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ error: "Description required" }, { status: 400 });
    }
    if (description.length < MIN_DESCRIPTION_CHARS) {
      return NextResponse.json(
        { error: `Description must be at least ${MIN_DESCRIPTION_CHARS} characters` },
        { status: 400 },
      );
    }
    if (description.length > MAX_DESCRIPTION_CHARS) {
      return NextResponse.json(
        { error: `Description must be under ${MAX_DESCRIPTION_CHARS} characters` },
        { status: 400 },
      );
    }

    let screenshotUrl = "";
    if (screenshot instanceof File && screenshot.size > 0) {
      if (!screenshot.type.startsWith("image/")) {
        return NextResponse.json({ error: "Screenshot must be an image" }, { status: 400 });
      }
      if (isDisallowedImage(screenshot)) {
        return NextResponse.json(
          { error: "SVG images are not allowed. Use PNG or JPEG." },
          { status: 400 },
        );
      }
      if (screenshot.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: "Screenshot must be under 5MB" }, { status: 400 });
      }
      if (!blobToken) {
        return NextResponse.json({ error: "Screenshot uploads are not configured yet" }, { status: 503 });
      }

      const ext = (screenshot.name.split(".").pop() || "png").toLowerCase();
      if (ext === "svg" || ext === "svgz") {
        return NextResponse.json({ error: "SVG uploads are not allowed" }, { status: 400 });
      }

      const key = `bug-reports/screenshots/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const uploaded = await put(key, screenshot, {
        access: "public",
        addRandomSuffix: false,
        contentType: screenshot.type || "image/png",
        token: blobToken,
      });
      screenshotUrl = uploaded.url;
    }

    const route = safeText(form.get("route"));
    const chain = safeText(form.get("chain"));
    const userAgent = req.headers.get("user-agent") || "unknown";

    /** Public JSON: mask wallet; full detail only in email to operator. */
    const payloadForBlob = {
      description,
      walletMasked: maskWallet(wallet),
      screenshotUrl,
      route,
      chain,
      userAgent,
      submittedAt: new Date().toISOString(),
    };
    if (blobToken) {
      const reportKey = `bug-reports/reports/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`;
      await put(reportKey, JSON.stringify(payloadForBlob, null, 2), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
        token: blobToken,
      });
    }

    // Always notify HQ Telegram â with OR without a screenshot.
    try {
      await notifyBugTelegram({
        screenshotUrl: screenshotUrl || undefined,
        descriptionPreview: description.slice(0, 400),
        route,
        walletMasked: maskWallet(wallet),
      });
    } catch (err) {
      console.error("[feedback] telegram notify failed", err);
    }

    if (!blobToken && !resend) {
      if (process.env.NODE_ENV === "development") {
        console.log("[feedback] dev-only mock submit", { ...payloadForBlob, walletFull: wallet });
        return NextResponse.json({ ok: true, mock: true });
      }
      return NextResponse.json({ error: "Feedback service is not configured" }, { status: 503 });
    }

    if (resend) {
      const subject = `Novex Bug Report: ${description.slice(0, 60)}${description.length > 60 ? "..." : ""}`;
      const safeDesc = escapeHtml(description);
      const safeWallet = escapeHtml(wallet || "N/A");
      const safeRoute = escapeHtml(route || "N/A");
      const safeChain = escapeHtml(chain || "N/A");
      const safeUa = escapeHtml(userAgent);
      const safeShot = screenshotUrl ? escapeHtml(screenshotUrl) : "";

      const html = `
        <h2>Novex Terminal Bug Report</h2>
        <p><strong>Description:</strong><br/>${safeDesc.replace(/\n/g, "<br/>")}</p>
        <p><strong>Wallet:</strong> ${safeWallet}</p>
        <p><strong>Route:</strong> ${safeRoute}</p>
        <p><strong>Chain:</strong> ${safeChain}</p>
        <p><strong>User Agent:</strong> ${safeUa}</p>
        <p><strong>Submitted:</strong> ${escapeHtml(payloadForBlob.submittedAt)}</p>
        ${safeShot ? `<p><strong>Screenshot:</strong><br/><a href="${safeShot}">${safeShot}</a></p>` : ""}
      `;

      await resend.emails.send({
        from: fromEmail,
        to: "clutchpbcfo@gmail.com",
        subject,
        html,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to submit report";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
