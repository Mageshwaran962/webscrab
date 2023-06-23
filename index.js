const puppeteer = require("puppeteer");
const finalArray = [];
(async function () {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.oreillyauto.com/search?q=strut");
  await page.waitForSelector(".product--interchange");

  // Get all the articles on the page
  const articles = await page.$$(".product--interchange");

  const attributes = await page.$$eval(
    "div.attributes div.attribute_wrap",
    (elements) => {
      return elements.map((element) => {
        const label = element.querySelector("span").textContent.trim();
        const value = element.querySelector("strong").textContent.trim();
        return { label, value };
      });
    }
  );
  for (const article of articles) {
    const productName = await article.$eval(
      ".product__name",
      (element) => element.innerText
    );
    const partNumber = await article.$eval(
      ".part-info__code.js-ga-product-line-number",
      (element) => element.innerText
    );
    const line = await article.$eval(
      ".part-info__code.js-ga-product-line-code",
      (element) => element.innerText
    );
    const attributes = await article.$$eval(".attribute_wrap", (elements) => {
      const attributeData = [];
      for (const element of elements) {
        const attribute = {
          name: element.querySelector("span:first-child").innerText,
          value: element.querySelector("span:last-child").innerText,
        };
        attributeData.push(attribute);
      }
      return attributeData;
    });
    finalArray.push({
      productName,
      partNumber,
      line,
      attributes,
    });
  }

  //   const data = await page.evaluate(function () {
  //     const scriptTag = document.querySelectorAll("article");
  //     return Array.from(scriptTag).map((art) => {
  //       const title = art.querySelector(".product__name").innerHTML;
  //       const partNumber = art.querySelector(
  //         ".part-info__code.js-ga-product-line-number"
  //       ).innerHTML;
  //       const line = art.querySelector(
  //         ".part-info__code.js-ga-product-line-code"
  //       ).innerHTML;
  //       // Extract the attributes
  //       const attribute = art.querySelectorAll(".attribute_wrap");
  //       //   const attributes = Array.from(
  //       //     art.querySelectorAll(".attribute_wrap")
  //       //   ).map((element) => {
  //       //     const attribute = element.querySelector("span").textContent.trim();
  //       //     const value = element.querySelector("strong").textContent.trim();
  //       //     return { attribute, value };
  //       //   });
  //       const attributes = Array.from(attribute).map((element) => {
  //         const attribute = element.querySelector("span:first-child");
  //         const value = element.querySelector("span:last-child");
  //         return { attribute, value };
  //       });
  //       return { title, partNumber, line, attributes };
  //     });
  //   });
  console.log("testedd", finalArray[0].attributes);
})();

// const puppeteer = require("puppeteer");

// (async function () {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto("https://www.oreillyauto.com/search?q=strut");

//   const [el] = await page.$x(
//     "/html/body/div[4]/div/div[3]/div[2]/div/div/div[2]/div[1]/div/article[1]/div[2]/span"
//   );
//   const src = await el.getProperty("src");
//   const srcTxt = await src.jsonValue();

//   console.log("final", el, src, srcTxt);
// })();
