// Renders the RoleOwl mascot SVG to transparent PNGs at several sizes.
// Usage: node scripts/export-owl.js
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { owlSvg } = require("./owl-svg");

const OUT = path.join(__dirname, "..", "public", "brand");
const SIZES = [256, 512, 1024];
const VARIANTS = ["happy", "sleepy"];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge" });
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  for (const variant of VARIANTS) {
    // The SVG's own width/height set the export resolution; scale per size.
    const raw = owlSvg(variant);
    for (const size of SIZES) {
      const svg = raw.replace(
        'width="120" height="120"',
        `width="${size}" height="${size}"`,
      );
      // Transparent page; element screenshot keeps alpha.
      await page.setContent(
        `<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`,
        { waitUntil: "networkidle" },
      );
      const el = await page.$("svg");
      const file = path.join(OUT, `owl-${variant}-${size}.png`);
      await el.screenshot({ path: file, omitBackground: true });
      console.log("wrote", path.relative(path.join(__dirname, ".."), file));
    }
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
