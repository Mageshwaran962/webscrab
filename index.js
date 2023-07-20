const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const productModel = require("./productModel");
const compatibilityData = require("./compatibilityModel");
const PORT = 5000;
let pageCount = 1;
let lastPageValue = 1;
const MONGO_URL = "mongodb://localhost:27017/chat";
const URL =
  "https://www.oreillyauto.com/shop/brands/a/masterpro-strut-mounts/msp";

let browser;
let page;
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

async function scrapeWebsite(url, page) {
  try {
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
      const nissanButton = document.querySelectorAll(
        "button.open-vehicle-table"
      );
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
        .replace(/[\d:]+/g, "")
        .trim();
      const value = $(this)
        .find("strong")
        .text()
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();

      productInfo[label] = value;
    });

    const productInfoData = new productModel(productInfo);
    await productInfoData.save();
    const compatibilityData = await compatibilityMakes($, productInfo);

    // console.log("ssssssssssss", productInfo, compatibilityData);

    return { productInfo, compatibilityData };
  } catch (error) {
    console.error("Error scraping website:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
async function compatibilityMakes($, info) {
  const compatibilityModels = $(".compatibility-models");
  const data = [];

  compatibilityModels.each(async (index, model) => {
    const make = $(model).find(".compatible-vehicle-name").text().trim();
    const application = $(model).find(".pdp-comp_info").text().trim();

    const tableRows = $(model).find(".vehicles-table tr");
    const finalData = tableRows
      .map(async (index, row) => {
        const columns = $(row).find("td");
        const [application, year] = columns.map((index, column) =>
          $(column).text().trim()
        );

        const document = {
          part: info.part,
          make,
          application,
          year,
        };
        data.push(document);
      })
      .get();
  });
  try {
    await compatibilityData.collection.insertMany(data);
    return data.length;
  } catch (error) {
    console.error("Error saving compatibility data:", error);
    return 0;
  }
  return data.length;
}
async function scrapeMultiplePages(url) {
  const scrapedData = [];
  let dataCount = 0; // Counter for the number of scraped data
  browser = await puppeteer.launch({ headless: false });
  page = await browser.newPage();
  const failedUrls = []; // Array to store failed URLs
  const filterParts = [];

  for (let i = 1; i <= lastPageValue; i++) {
    try {
      await page.goto(url + `?page=${i}`);
      if (i === 1) {
        const value = await lastPageValueFuc(page);
        lastPageValue = Math.ceil(value);
      }
      await page.waitForSelector(".js-product-link");

      const hrefValues = await page.evaluate(() => {
        const anchorElements = document.querySelectorAll(".js-product-link");
        const values = Array.from(anchorElements).map((element) => {
          const url = element.getAttribute("href");
          const startPos = url.lastIndexOf("/") + 1; // Get the index of the last '/'
          const endPos = url.indexOf("?pos"); // Get the index of '?pos'
          const value = url.substring(startPos, endPos); // Extra

          return { urls: url, part: value };
        });
        return values;
      });
      const uniqueHrefValues = await findDuplicate(hrefValues);
      console.log(
        "afterrrrrr check all",
        hrefValues.length,
        "ddddiffff",
        uniqueHrefValues.length
      );
      for (const url of uniqueHrefValues) {
        try {
          dataCount++;
          const data = await scrapeWebsite(url.urls, page);
          if (data) {
            scrapedData.push(data);
          }
          if (dataCount === 50) {
            await browser.close(); // Close the current browser
            browser = await puppeteer.launch({ headless: false }); // Open a new browser
            page = await browser.newPage(); // Create a new page
            dataCount = 0; // Reset the data count
          }
          console.log("dataCount", dataCount);
        } catch (error) {
          console.error("Error scraping website:", error);
          failedUrls.push(url.urls); // Add the failed URL to the array
        }
      }
      // console.log("finallll", scrapedData);
    } catch (error) {
      console.error("Error navigating to page:", error);
    }
  }

  // Retry failed URLs
  for (const url of failedUrls) {
    try {
      const data = await retryScrapeWebsite(url.urls, page);
      scrapedData.push(data);
    } catch (error) {
      console.error("Error retrying failed URL:", error);
    }
  }

  await browser.close();
}

async function callScrapeWebsite(url) {
  try {
    console.log("ffffffff", browser, page);
    if (!browser) {
      browser = await puppeteer.launch({ headless: false });
      page = await browser.newPage();
    }

    await scrapeWebsite(url, page);
    // Process the result or perform any other operations
    // ...
  } catch (error) {
    console.error("Error calling scrapeWebsite:", error);
  } finally {
    if (page) {
      await page.close();
    }
  }
}
async function retryScrapeWebsite(url, page) {
  const maxRetries = 10; // Maximum number of retry attempts
  const retryDelay = 5000; // Delay in milliseconds between retry attempts
  let retries = 0;
  if (retries == 0) {
    await page.close(); // Close the current page
    await browser.close(); // Close the current browser

    browser = await puppeteer.launch({ headless: false }); // Open a new browser
    page = await browser.newPage();
  }
  while (retries < maxRetries) {
    try {
      const data = await scrapeWebsite(url, page);
      return data;
    } catch (error) {
      console.error(
        `Error retrying scrape for URL: ${url}, Retry: ${retries + 1}`,
        error
      );
      retries++;

      if (retries < maxRetries) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw new Error(`Scrape for URL failed after ${maxRetries} attempts: ${url}`);
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
async function findDuplicate(dataset) {
  const filteredData = [];
  for (const ele of dataset) {
    const existingProduct = await productModel.findOne({
      part: ele.part.toUpperCase(),
    });
    if (existingProduct === null) {
      filteredData.push(ele);
    }
  }
  return filteredData;
}
scrapeMultiplePages(URL);
