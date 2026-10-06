const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer");

(async () => {
  const htmlPath = path.resolve(__dirname, "خطة_منصة_منجزات.html");
  const pdfPath = path.resolve(__dirname, "خطة_منصة_منجزات.pdf");
  const cachedChrome = path.resolve(
    __dirname,
    ".puppeteer-cache/chrome/linux-154.0.8037.57/chrome-linux64/chrome"
  );
  const launchOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  };
  if (fs.existsSync(cachedChrome)) {
    launchOptions.executablePath = cachedChrome;
  }
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle0", timeout: 60000 });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
  });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", right: "14mm", bottom: "18mm", left: "14mm" },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate:
      '<div style="width:100%;font-size:9px;color:#5c6570;text-align:center;font-family:\'Segoe UI\',Tahoma,sans-serif;direction:rtl;padding:0 12mm;">منجزات — خطة توثيق المنجزات | صفحة <span class="pageNumber"></span> من <span class="totalPages"></span></div>',
  });
  await browser.close();
  console.log(`PDF written: ${pdfPath}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
