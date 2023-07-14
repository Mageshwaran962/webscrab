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
    "https://www.oreillyauto.com/detail/c/masterpro-strut-assemblies/masterpro-strut-assembly/msa0/33gm1110?q=struts&pos=0"
  );
  // Get the HTML content after executing JavaScript

  await page.evaluate(() => {
    const elementToClick = document.querySelectorAll(".product-list_title");
    elementToClick.forEach((element) => {
      if (element.innerText.trim() === "Compatibility") {
        element.click();
      }
    });
  });
  // Wait for the new component to appear
  await page.waitForSelector(".compatibility-models");
  await page.waitForSelector("button.open-vehicle-table");

  // Click on the result element in the new component
  await page.evaluate(() => {
    const nissanButton = document.querySelectorAll("button.open-vehicle-table");
    nissanButton.forEach((element) => {
      element.click();
    });
  });
  await page.waitForSelector("table.vehicles-table");

  const updatedHTML = await page.evaluate(() => {
    return document.documentElement.innerHTML;
  });
  // await browser.close();

  // Continue with Cheerio for extracting product information
  const $ = cheerio.load(updatedHTML);

  // Extract product information using Cheerio
  const productInfo = {};

  $(".product-list-details li").each(function () {
    const label = $(this)
      .find("span")
      .text()
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const value = $(this)
      .find("strong")
      .text()
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    productInfo[label] = value;
  });
  const compatibilityData = await page.evaluate(() => {
    const compatibilityModels = document.querySelectorAll(
      ".compatibility-models"
    );

    const data = [];

    compatibilityModels.forEach((model) => {
      const make = model
        .querySelector(".compatible-vehicle-name")
        ?.textContent.trim();
      const application = model
        .querySelector(".pdp-comp_info")
        ?.textContent.trim();

      const tableRows = Array.from(
        document.querySelectorAll(".vehicles-table tr")
      );

      const finalData = tableRows.map((row) => {
        const columns = Array.from(row.querySelectorAll("td"));
        return columns.map((column) => column.innerText);
      });

      data.push({
        make,
        application,
        finalData,
      });
    });

    return data;
  });

  return { productInfo, compatibilityData };
}
scrapeWebsite()
  .then((productInfo) => {
    console.log("Product Information:", JSON.stringify(productInfo, null, 2));
  })
  .catch((error) => {
    console.log("Error:", error);
  });
