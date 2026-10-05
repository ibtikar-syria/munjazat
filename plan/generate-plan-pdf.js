const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const htmlPath = path.resolve(__dirname, "خطة_منصة_منجزات.html");
  const pdfPath = path.resolve(__dirname, "خطة_منصة_منجزات.pdf");
  const executablePath = path.resolve(
    __dirname,
    ".puppeteer-cache/chrome/linux-154.0.8037.57/chrome-linux64/chrome"
  );
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0" });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", right: "14mm", bottom: "18mm", left: "14mm" },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate:
      '<div style="width:100%;font-size:9px;color:#5c6570;text-align:center;font-family:\'Noto Naskh Arabic\',serif;direction:rtl;">منجزات — خطة المنصة | صفحة <span class="pageNumber"></span> من <span class="totalPages"></span></div>',
  });
  await browser.close();
  console.log(`PDF written: ${pdfPath}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
