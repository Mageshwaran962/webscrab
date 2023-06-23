const puppeteer = require("puppeteer");

(async function () {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.oreillyauto.com/search?q=strut");

  const data = await page.evaluate(function () {
    const scriptTag = document.querySelectorAll("article");
    return Array.from(scriptTag).map((art) => {
      const title = art.querySelector(".product__name").innerHTML;
      const partNumber = art.querySelector(
        ".part-info__code.js-ga-product-line-number"
      ).innerHTML;
      const line = art.querySelector(
        ".part-info__code.js-ga-product-line-code"
      ).innerHTML;
      // Extract the attributes
      const attributes = Array.from(
        art.querySelectorAll(".attribute_wrap")
      ).map((element) => {
        const attribute = element.querySelector("span").textContent.trim();
        const value = element.querySelector("strong").textContent.trim();
        return { attribute, value };
      });
      return { title, partNumber, line, attributes };
    });
  });
  console.log("testedd", JSON.stringify(data));
})();
