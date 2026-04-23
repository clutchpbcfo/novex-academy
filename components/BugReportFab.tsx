"use client";

/**
 * BugReportFab — floating Report-a-Bug button for academy.novex.finance.
 *
 * Mirrors the hardened quests FAB (PR #6) but uses JSX and is self-contained
 * (no dependency on terminal's 3741-line page).
 *
 * Backend contract (POST /api/feedback, multipart/form-data):
 *   description   — string, 10..4000 chars (required)
 *   wallet        — optional string (academy has no wallet connect by default)
 *   screenshot    — optional File (<5 MB, image/*)
 *   route         — path the user was on when they clicked
 *   chain         — "n/a" on academy
 *   website       — honeypot (must be empty to pass)
 *   _t            — ms delta from modal-open to submit (must be >= 2000)
 *
 * Success UX: prominent green card with checkmark, auto-closes after 2.5s.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

type SubmitState = "idle" | "submitting" | "success" | "error";

export function BugReportFab() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [wallet, setWallet] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const openedAtRef = useRef<number>(0);

  // Revoke preview URL on unmount / change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resetForm = useCallback(() => {
    setDescription("");
    setWallet("");
    setScreenshot(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setHoneypot("");
    setErrorMsg("");
  }, [previewUrl]);

  const handleOpen = useCallback(() => {
    resetForm();
    setSuccessMsg("");
    setState("idle");
    openedAtRef.current = Date.now();
    setOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    setOpen(false);
    resetForm();
    setState("idle");
    setSuccessMsg("");
  }, [resetForm]);

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      if (!f) {
        setScreenshot(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        return;
      }
      if (!f.type.startsWith("image/")) {
        setErrorMsg("Screenshot must be an image.");
        return;
      }
      if (f.size > MAX_SCREENSHOT_BYTES) {
        setErrorMsg("Screenshot must be under 5 MB.");
        return;
      }
      setErrorMsg("");
      setScreenshot(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(f));
    },
    [previewUrl]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (state === "submitting") return;

      const trimmed = description.trim();
      if (trimmed.length < 10) {
        setErrorMsg("Please describe the issue in at least 10 characters.");
        return;
      }

      setState("submitting");
      setErrorMsg("");

      try {
        const fd = new FormData();
        fd.append("description", trimmed);
        if (wallet.trim()) fd.append("wallet", wallet.trim());
        if (screenshot) fd.append("screenshot", screenshot);
        fd.append(
          "route",
          typeof window !== "undefined" ? window.location.pathname : "/"
        );
        fd.append("chain", "n/a");
        fd.append("website", honeypot); // honeypot — must stay empty
        fd.append(
          "_t",
          String(Date.now() - (openedAtRef.current || Date.now()))
        );

        const res = await fetch("/api/feedback", {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          let errText = "Something went wrong. Try again in a moment.";
          try {
            const j = await res.json();
            if (j?.error && typeof j.error === "string") errText = j.error;
          } catch {
            // ignore
          }
          setErrorMsg(errText);
          setState("error");
          return;
        }

        // Note: honeypot-trip also returns 200 with {ok:true} — silent success
        // is acceptable here; we never want to tell a bot it was flagged.
        setSuccessMsg("Report sent — Clutch got it. We'll reach out if needed.");
        setState("success");
        resetForm();

        window.setTimeout(() => {
          setOpen(false);
          setSuccessMsg("");
          setState("idle");
        }, 2500);
      } catch {
        setErrorMsg("Network error. Try again.");
        setState("error");
      }
    },
    [description, wallet, screenshot, honeypot, state, resetForm]
  );

  return (
    <>
      <button
        type="button"
        aria-label="Report a bug"
        onClick={handleOpen}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9998,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "1px solid rgba(34,211,238,0.55)",
          background:
            "linear-gradient(135deg, rgba(34,211,238,0.22), rgba(34,211,238,0.06))",
          color: "#22d3ee",
          fontSize: 22,
          cursor: "pointer",
          boxShadow: "0 0 18px rgba(34,211,238,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Rajdhani, sans-serif",
        }}
      >
        🐞
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report a bug"
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(ev) => ev.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 460,
              background: "#0b1220",
              border: "1px solid rgba(34,211,238,0.35)",
              borderRadius: 14,
              padding: 18,
              boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
              fontFamily: "Rajdhani, sans-serif",
              color: "#e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  letterSpacing: 0.3,
                  color: "#22d3ee",
                }}
              >
                Report a bug
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 20,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {successMsg && (
              <div
                role="status"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(34,197,94,0.55)",
                  background:
                    "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(34,197,94,0.06))",
                  color: "#22c55e",
                  fontSize: 13,
                  marginBottom: 10,
                  boxShadow: "0 0 18px rgba(34,197,94,0.18)",
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(34,197,94,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✓
                </span>
                <span style={{ flex: 1 }}>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid rgba(239,68,68,0.5)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#fca5a5",
                  fontSize: 12,
                  marginBottom: 10,
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Honeypot — hidden from humans, catches bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(ev) => setHoneypot(ev.target.value)}
                style={{
                  position: "absolute",
                  left: -10000,
                  top: "auto",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  opacity: 0,
                }}
              />

              <label
                htmlFor="fab-desc"
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#94a3b8",
                  marginBottom: 6,
                }}
              >
                What went wrong? <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                id="fab-desc"
                value={description}
                onChange={(ev) => setDescription(ev.target.value)}
                placeholder="Describe the issue, what you expected, and any steps to reproduce."
                rows={4}
                maxLength={4000}
                required
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 8,
                  color: "#e5e7eb",
                  padding: "10px 12px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "vertical",
                  marginBottom: 10,
                }}
              />

              <label
                htmlFor="fab-wallet"
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#94a3b8",
                  marginBottom: 6,
                }}
              >
                Wallet (optional)
              </label>
              <input
                id="fab-wallet"
                type="text"
                value={wallet}
                onChange={(ev) => setWallet(ev.target.value)}
                placeholder="0x…"
                autoComplete="off"
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 8,
                  color: "#e5e7eb",
                  padding: "10px 12px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  marginBottom: 10,
                }}
              />

              <label
                htmlFor="fab-screenshot"
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#94a3b8",
                  marginBottom: 6,
                }}
              >
                Screenshot (optional, ≤ 5 MB)
              </label>
              <input
                id="fab-screenshot"
                type="file"
                accept="image/*"
                onChange={handleFile}
                style={{
                  width: "100%",
                  color: "#94a3b8",
                  fontSize: 12,
                  marginBottom: 10,
                }}
              />
              {previewUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="preview"
                  style={{
                    width: "100%",
                    maxHeight: 160,
                    objectFit: "contain",
                    borderRadius: 8,
                    border: "1px solid rgba(148,163,184,0.25)",
                    marginBottom: 10,
                  }}
                />
              )}

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 6,
                }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={state === "submitting"}
                  style={{
                    padding: "8px 14px",
                    background: "transparent",
                    border: "1px solid rgba(148,163,184,0.35)",
                    borderRadius: 8,
                    color: "#cbd5e1",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state === "submitting"}
                  style={{
                    padding: "8px 16px",
                    background:
                      state === "submitting"
                        ? "rgba(34,211,238,0.2)"
                        : "linear-gradient(135deg, rgba(34,211,238,0.35), rgba(34,211,238,0.15))",
                    border: "1px solid rgba(34,211,238,0.55)",
                    borderRadius: 8,
                    color: "#22d3ee",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: state === "submitting" ? "wait" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {state === "submitting" ? "Sending…" : "Send report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default BugReportFab;
