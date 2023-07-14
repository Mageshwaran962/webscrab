const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const ProductInformation = require("./productModel");
const PORT = 5000;
let pageCount = 1;
let lastPageValue = 1;
const MONGO_URL = "mongodb://localhost:27017/chat";
const URL = "https://www.oreillyauto.com/shop/brands/a/masterpro-shocks/mss";
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log("DB error message", err.message);
  });
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

async function scrapeWebsite(url, page) {
  // const browser = await puppeteer.launch({ headless: false });
  // const page = await browser.newPage();
  // await page.setContent(html); // Replace `html` with the provided HTML content
  await page.goto("https://www.oreillyauto.com/" + url);
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
  const h1Element = $("h1.js-product-name");

  const line = h1Element.attr("data-line");
  const part = h1Element.attr("data-item");
  const name = h1Element.text();
  productInfo["name"] = name;
  productInfo["part"] = part;
  productInfo["line"] = line;
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
  const compatibilityData = await compatibilityMakes($, productInfo);

  console.log("ssssssssssss", productInfo, compatibilityData);
  return { productInfo, compatibilityData };
}
async function compatibilityMakes($, info) {
  const compatibilityModels = $(".compatibility-models");
  const data = [];

  compatibilityModels.each((index, model) => {
    const make = $(model).find(".compatible-vehicle-name").text().trim();
    const application = $(model).find(".pdp-comp_info").text().trim();

    const tableRows = $(model).find(".vehicles-table tr");
    const finalData = tableRows
      .map((index, row) => {
        const columns = $(row).find("td");
        const [application, year, vehicleNumber] = columns.map(
          (index, column) => $(column).text().trim()
        );

        return {
          application,
          year,
          vehicleNumber,
        };
      })
      .get();

    data.push({
      name: info.name,
      line: info.line,
      make,
      application,
      finalData,
    });
  });

  return data;

  // await page.evaluate(() => {
  //   const compatibilityModels = document.querySelectorAll(
  //     ".compatibility-models"
  //   );

  //   const data = [];

  //   compatibilityModels.forEach((model) => {
  //     const make = model
  //       .querySelector(".compatible-vehicle-name")
  //       ?.textContent.trim();
  //     const application = model
  //       .querySelector(".pdp-comp_info")
  //       ?.textContent.trim();
  //     const tableRows = Array.from(
  //       document.querySelectorAll(".vehicles-table tr")
  //     );
  //     const finalData = tableRows.map((row) => {
  //       const columns = Array.from(row.querySelectorAll("td"));
  //       const [application, year, vehicleNumber] = columns.map(
  //         (column) => column.innerText
  //       );
  //       return {
  //         application,
  //         year,
  //         vehicleNumber,
  //       };
  //     });

  //     data.push({

  //       make,
  //       application,
  //       finalData,
  //     });
  //   });

  //   return data;
  // });
}

async function scrapeMultiplePages(url) {
  const scrapedData = [];
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  for (let i = 1; i <= lastPageValue; i++) {
    await page.goto(url + `?page=${i}`);
    if (i == 1) {
      const value = await lastPageValueFuc(page);
      lastPageValue = Math.ceil(value);
    }
    await page.waitForSelector(".js-product-link");

    // Extract all href values from the anchor elements
    const hrefValues = await page.evaluate(() => {
      const anchorElements = document.querySelectorAll(".js-product-link");
      const values = Array.from(anchorElements).map((element) =>
        element.getAttribute("href")
      );
      return values;
    });
    console.log("check all", hrefValues);

    for (const url of hrefValues) {
      const data = await scrapeWebsite(url, page);
      scrapedData.push(data);
    }
    // await browser.close();
    console.log("finallll", scrapedData);
  }
}
const lastPageValueFuc = async (page) => {
  const strongValues = await page.evaluate(() => {
    const strongElements = document.querySelectorAll(
      ".plp-results-count strong"
    );
    const values = Array.from(strongElements).map((element) =>
      element.textContent.trim()
    );
    return values;
  });
  return Number(strongValues[1]) / 24;
};
scrapeMultiplePages(URL);
