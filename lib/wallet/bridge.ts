// lib/wallet/bridge.ts — Cross-subdomain wallet session bridge
// Cookie at .novex.finance domain, AES-GCM encrypted, BroadcastChannel sync

const COOKIE_NAME = "novex_session";
const COOKIE_DOMAIN = ".novex.finance";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
const BROADCAST_CHANNEL = "novex-session";

export interface WalletSession {
  wallet: string;
  chainId: number;
  connectedAt: number;
  provider: string;
}

// Helper: Uint8Array → ArrayBuffer (avoids strict TS ArrayBufferLike issues)
function toAB(arr: Uint8Array): ArrayBuffer {
  return (arr.buffer as ArrayBuffer).slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

// --- AES-GCM Encryption (graceful fallback to base64 if no secret) ---

function hasEncryptionSecret(): boolean {
  try {
    return (
      typeof process !== "undefined" &&
      !!process.env.NEXT_PUBLIC_NOVEX_SESSION_SECRET
    );
  } catch {
    return false;
  }
}

async function getEncryptionKey(): Promise<CryptoKey> {
  const secret = process.env.NEXT_PUBLIC_NOVEX_SESSION_SECRET;
  if (!secret) throw new Error("[wallet-bridge] NEXT_PUBLIC_NOVEX_SESSION_SECRET not set");
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    toAB(encoder.encode(secret)),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toAB(encoder.encode("novex-wallet-bridge-v1")),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(data: string): Promise<string> {
  if (!hasEncryptionSecret()) {
    // Fallback: base64 encode (not secure, but functional for dev)
    return btoa(encodeURIComponent(data));
  }
  const key = await getEncryptionKey();
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    toAB(encoder.encode(data))
  );
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...Array.from(combined)));
}

async function decrypt(encoded: string): Promise<string> {
  if (!hasEncryptionSecret()) {
    // Fallback: base64 decode
    return decodeURIComponent(atob(encoded));
  }
  const key = await getEncryptionKey();
  const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    toAB(ciphertext)
  );
  return new TextDecoder().decode(decrypted);
}

// --- Cookie Operations ---

export function setSessionCookie(session: WalletSession): void {
  if (typeof document === "undefined") return;
  encrypt(JSON.stringify(session)).then((encrypted) => {
    document.cookie = [
      `${COOKIE_NAME}=${encrypted}`,
      `domain=${COOKIE_DOMAIN}`,
      `path=/`,
      `max-age=${COOKIE_MAX_AGE}`,
      `SameSite=Lax`,
      `Secure`,
    ].join("; ");
  });
}

export async function getSessionCookie(): Promise<WalletSession | null> {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  const sessionCookie = cookies
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!sessionCookie) return null;
  try {
    const encrypted = sessionCookie.split("=").slice(1).join("=");
    const decrypted = await decrypt(encrypted);
    return JSON.parse(decrypted) as WalletSession;
  } catch (err) {
    console.warn("[wallet-bridge] Failed to decrypt session cookie:", err);
    clearSessionCookie();
    return null;
  }
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; domain=${COOKIE_DOMAIN}; path=/; max-age=0`;
}

// --- BroadcastChannel Cross-Tab Sync ---

let channel: BroadcastChannel | null = null;

export function initSessionSync(
  onConnect: (session: WalletSession) => void,
  onDisconnect: () => void
): () => void {
  if (typeof window === "undefined") return () => {};
  channel = new BroadcastChannel(BROADCAST_CHANNEL);
  channel.onmessage = (event) => {
    const { type, session } = event.data;
    if (type === "connect" && session) {
      onConnect(session);
    } else if (type === "disconnect") {
      onDisconnect();
    }
  };
  return () => {
    channel?.close();
    channel = null;
  };
}

export function broadcastConnect(session: WalletSession): void {
  setSessionCookie(session);
  channel?.postMessage({ type: "connect", session });
}

export function broadcastDisconnect(): void {
  clearSessionCookie();
  channel?.postMessage({ type: "disconnect" });
}

// --- Backward Compatibility ---
// wallet-modal.tsx imports these names from the old bridge

export function broadcastSession(session: WalletSession): void {
  broadcastConnect(session);
}

export function subscribeToSessionChanges(
  callback: (session: WalletSession | null) => void
): () => void {
  return initSessionSync(
    (session) => callback(session),
    () => callback(null)
  );
}
