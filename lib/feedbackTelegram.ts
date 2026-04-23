import { escapeHtml } from "@/lib/feedbackSecurity";

type TgApiOk<T = unknown> = { ok: true; result: T } | { ok: false; description?: string; error_code?: number };

/**
 * Notify HQ Telegram when a bug report is submitted.
 * Always fires — with or without a screenshot.
 *
 * Env:
 *   TELEGRAM_BOT_TOKEN          — same bot as cron (NOVEXSENSEIBOT)
 *   FEEDBACK_TELEGRAM_CHAT_ID   — HQ chat or DM target
 *   TELEGRAM_BUG_DM_CHAT_ID     — legacy fallback env var
 *
 * If screenshotUrl is present, we sendPhoto with a caption. If sendPhoto fails
 * (e.g. the bot can't DM the chat yet) we fall back to sendMessage with the
 * screenshot link. If no screenshotUrl is provided, we go straight to
 * sendMessage so text-only reports still reach HQ.
 */
export async function notifyBugTelegram(opts: {
  screenshotUrl?: string;
  descriptionPreview: string;
  route: string;
  walletMasked: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIdRaw =
    process.env.FEEDBACK_TELEGRAM_CHAT_ID?.trim() ||
    process.env.TELEGRAM_BUG_DM_CHAT_ID?.trim();

  if (!token || !chatIdRaw) {
    console.info("[feedback] telegram skipped", {
      reason: !token ? "missing_TELEGRAM_BOT_TOKEN" : "missing_FEEDBACK_TELEGRAM_CHAT_ID",
      hasScreenshotUrl: !!opts.screenshotUrl,
    });
    return;
  }

  /** Telegram accepts string or number; trim accidental quotes from .env paste */
  const chatId = chatIdRaw.replace(/^["']|["']$/g, "");

  const desc = escapeHtml(opts.descriptionPreview.slice(0, 280));
  const route = escapeHtml(opts.route || "/terminal");
  const wallet = escapeHtml(opts.walletMasked || "n/a");

  const base = `https://api.telegram.org/bot${token}`;

  const parseTg = async (res: Response): Promise<TgApiOk> => {
    try {
      return (await res.json()) as TgApiOk;
    } catch {
      return { ok: false, description: `non-json HTTP ${res.status}` };
    }
  };

  // Path A: screenshot attached. Try sendPhoto first.
  if (opts.screenshotUrl) {
    const caption =
      `🖼 <b>Novex bug screenshot</b>\n` +
      `${desc}\n\n` +
      `📍 <code>${route}</code>\n` +
      `👛 <code>${wallet}</code>`.slice(0, 1024);

    const photoRes = await fetch(`${base}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        photo: opts.screenshotUrl,
        caption,
        parse_mode: "HTML",
      }),
    });

    const photoData = await parseTg(photoRes);
    if (photoData.ok) {
      console.info("[feedback] telegram sendPhoto ok");
      return;
    }

    const photoErr = photoData.description || `HTTP ${photoRes.status}`;
    console.warn("[feedback] telegram sendPhoto failed, falling back to sendMessage", {
      error: photoErr,
      error_code: photoData.error_code,
    });

    const linkText =
      `🖼 <b>Novex bug screenshot</b> (open link)\n` +
      `${desc}\n\n` +
      `📍 <code>${route}</code>\n` +
      `👛 <code>${wallet}</code>\n\n` +
      `<a href="${escapeHtml(opts.screenshotUrl)}">Screenshot</a>`.slice(0, 4096);

    const msgRes = await fetch(`${base}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: linkText,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });

    const msgData = await parseTg(msgRes);
    if (!msgData.ok) {
      const msgErr = msgData.description || `HTTP ${msgRes.status}`;
      throw new Error(`Telegram sendPhoto: ${photoErr}; sendMessage: ${msgErr}`);
    }

    console.info("[feedback] telegram sendMessage fallback ok");
    return;
  }

  // Path B: no screenshot. sendMessage text-only.
  const text =
    `🐞 <b>Novex bug report</b>\n` +
    `${desc}\n\n` +
    `📍 <code>${route}</code>\n` +
    `👛 <code>${wallet}</code>`.slice(0, 4096);

  const msgRes = await fetch(`${base}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const msgData = await parseTg(msgRes);
  if (!msgData.ok) {
    const msgErr = msgData.description || `HTTP ${msgRes.status}`;
    throw new Error(`Telegram sendMessage (text-only): ${msgErr}`);
  }

  console.info("[feedback] telegram sendMessage (text-only) ok");
}

/**
 * @deprecated Use notifyBugTelegram. Kept as an alias so any caller that
 * still imports the old name continues to work.
 */
export const notifyBugScreenshotTelegram = notifyBugTelegram;
