const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const sampleModel = require("./model");
const PORT = 5000;
const MONGO_URL = "mongodb://localhost:27017/chat";

// mongoose
//   .connect(MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("DB connected successfully");
//   })
//   .catch((err) => {
//     console.log("DB error message", err.message);
//   });
// const sampleCreation = async () => {
//   const sample = new sampleModel({
//     productId: "12",
//     productName: "shocks",
//     description: "vechile parts",
//     price: 43,
//     quantity: 1,
//     categoryIds: ["test 20101"],
//     isActive: true,
//     createdAt: new Date(),
//     imageUrl: "ggggshhss",
//   });
//   const response = await sample.save();
//   console.log("ssss", { id: response.id, ...response._doc });
// };
// sampleCreation();
// async function scrapeProductInfo() {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();
//   await page.goto(
//     "https://www.oreillyauto.com/detail/c/masterpro-shocks/masterpro-shock-absorber/mss0/ns128?pos=0&manufacturer=true"
//   );
//   // const divElement = await page.$(".product__image-wrap");

//   // Trigger a click event on the div element
//   // await divElement.click();
//   const data = await page.evaluate(function () {
//     // const scriptTag = document.querySelectorAll("article");
//     // return Array.from(scriptTag).map((art) => {
//     //   const title = art.querySelector(".product__name").innerHTML;
//     //   const partNumber = art.querySelector(
//     //     ".part-info__code.js-ga-product-line-number"
//     //   ).innerHTML;
//     //   const line = art.querySelector(
//     //     ".part-info__code.js-ga-product-line-code"
//     //   ).innerHTML;
//     //   // Extract the attributes
//     //   const attributes = Array.from(
//     //     art.querySelectorAll(".attribute_wrap")
//     //   ).map((element) => {
//     //     const attribute = element.querySelector("span").textContent.trim();
//     //     const value = element.querySelector("strong").textContent.trim();
//     //     return { attribute, value };
//     //   });
//     //   return { title, partNumber, line, attributes };
//     // });
//     const info = {};

//     const titleElement = document.querySelector(".pdp-info_title");
//     info.title = titleElement.textContent.trim();

//     const listItems = document.querySelectorAll(".product-list-details li");
//     listItems.forEach((item) => {
//       const label = item
//         .querySelector("span")
//         .textContent.trim()
//         .replace(":", "");
//       const value = item.querySelector("strong").textContent.trim();

//       info[label] = value;
//     });

//     return info;
//   });
//   // console.log("testedd", JSON.stringify(data));
// }
// async function scrapeProductInfo() {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   // Set the HTML content of the page
//   await page.goto(
//     "https://www.oreillyauto.com/detail/c/masterpro-shocks/masterpro-shock-absorber/mss0/ns128?pos=0&manufacturer=true"
//   );
//   // await page.setContent(html);

//   // Use Puppeteer to extract the product information
//   const productInfo = await page.evaluate(() => {
//     const info = {};

//     const titleElement = document.querySelector(".pdp-info_title");
//     info.title = titleElement.textContent.trim();

//     const listItems = document.querySelectorAll(".product-list-details li");
//     listItems.forEach((item) => {
//       const label = item
//         .querySelector("span")
//         .textContent.trim()
//         .replace(":", "");
//       const value = item.querySelector("strong").textContent.trim();

//       info[label] = value;
//     });

//     return info;
//   });

//   await browser.close();

//   return productInfo;
// }
async function scrapeWebsite() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // await page.setContent(html); // Replace `html` with the provided HTML content
  await page.goto(
    "https://www.oreillyauto.com/detail/c/masterpro-shocks/masterpro-shock-absorber/mss0/ns128?pos=0&manufacturer=true"
  );
  // Get the HTML content after executing JavaScript
  const updatedHTML = await page.evaluate(() => {
    return document.documentElement.innerHTML;
  });

  await browser.close();

  // Continue with Cheerio for extracting product information
  const $ = cheerio.load(updatedHTML);

  // Extract product information using Cheerio
  const productInfo = {};

  productInfo.title = $(".pdp-info_title").text().trim();

  $(".product-list-details li").each(function () {
    const label = $(this).find("span").text().trim().replace(":", "");
    const value = $(this).find("strong").text().trim();

    productInfo[label] = value;
  });

  return productInfo;
}
scrapeWebsite()
  .then((productInfo) => {
    console.log("Product Information:", productInfo);
  })
  .catch((error) => {
    console.log("Error:", error);
  });
