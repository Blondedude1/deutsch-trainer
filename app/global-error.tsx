"use client";

import { repairAndReload } from "@/lib/repair";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f6f6f3", color: "#1a1d21", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Something broke</h1>
          <p style={{ margin: 0, fontSize: 14 }}>Your progress is safe. Repair clears the offline copy of the app and reloads it.</p>
          <p style={{ margin: 0, fontSize: 12, color: "#5b636d", wordBreak: "break-word" }}>{error.message}</p>
          <button
            type="button"
            onClick={repairAndReload}
            style={{ minHeight: 48, border: 0, borderRadius: 10, background: "#0e7490", color: "#fff", fontSize: 14, fontWeight: 600 }}
          >
            Repair and reload
          </button>
        </div>
      </body>
    </html>
  );
}
