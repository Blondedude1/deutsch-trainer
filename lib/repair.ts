"use client";

/**
 * Clears the offline cache and service worker, then reloads.
 * Never touches IndexedDB, so progress, attempts and the saved key survive.
 */
export async function repairAndReload() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } finally {
    window.location.reload();
  }
}

/** A stale or broken script chunk: repair automatically, once per tab. */
export function isChunkError(message: string) {
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Unexpected token '<'/i.test(message);
}
