// Renders the app icons with the preinstalled Chromium. Run: node scripts/make-icons.cjs
const { chromium } = require("playwright");

const html = (size, pad) => `<!doctype html><html><body style="margin:0">
<div style="width:${size}px;height:${size}px;background:#F6F6F3;display:flex;align-items:center;justify-content:center">
  <div style="width:${size - pad * 2}px;height:${size - pad * 2}px;border-radius:${(size - pad * 2) * 0.22}px;background:#FFFFFF;border:${Math.max(2, size / 96)}px solid #9FD0DC;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${size * 0.03}px">
    <span style="font:700 ${size * 0.36}px 'DejaVu Sans Mono',monospace;color:#0E7490;line-height:1">dt</span>
    <span style="display:flex;gap:${size * 0.03}px">
      <span style="width:${size * 0.09}px;height:${size * 0.03}px;background:#2563EB"></span>
      <span style="width:${size * 0.09}px;height:${size * 0.03}px;background:#DC2626"></span>
      <span style="width:${size * 0.09}px;height:${size * 0.03}px;background:#16A34A"></span>
    </span>
  </div>
</div></body></html>`;

(async () => {
const browser = await chromium.launch();
const page = await browser.newPage();
const out = [
  ["public/icons/icon-192.png", 192, 8],
  ["public/icons/icon-512.png", 512, 20],
  ["public/icons/icon-maskable-512.png", 512, 80],
  ["public/icons/apple-touch-icon.png", 180, 0],
];
for (const [file, size, pad] of out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html(size, pad));
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: size, height: size } });
}
await browser.close();
console.log("icons written");
})();
