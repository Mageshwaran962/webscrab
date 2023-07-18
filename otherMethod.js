const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const productModel = require("./productModel");
const compatibilityData = require("./compatibilityModel");
const PORT = 5000;
let pageCount = 1;
let lastPageValue = 1;
const MONGO_URL = "mongodb://localhost:27017/chat";
const URL = "https://www.oreillyauto.com/shop/brands/a/masterpro-shocks/mss";
const checkpointFile = path.join(__dirname, "checkpoint.json"); // Path to the checkpoint file

// Function to check if the checkpoint file exists
const doesCheckpointFileExist = () => {
  try {
    fs.accessSync(checkpointFile);
    return true;
  } catch (error) {
    return false;
  }
};

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

// Function to save the checkpoint
async function saveCheckpoint(data) {
  try {
    await fs.promises.writeFile(checkpointFile, JSON.stringify(data));
    console.log("Checkpoint saved successfully.");
  } catch (error) {
    console.error("Error saving checkpoint:", error);
  }
}

// Function to load the checkpoint
async function loadCheckpoint() {
  try {
    const data = await fs.promises.readFile(checkpointFile);
    return JSON.parse(data);
  } catch (error) {
    console.error("Error loading checkpoint:", error);
    return null;
  }
}

// Function to scrape multiple pages
async function scrapeMultiplePages(url) {
  let checkpoint = await loadCheckpoint();
  if (!checkpoint) {
    checkpoint = {
      currentPage: 1,
      scrapedData: [],
      failedUrls: [],
    };
  }

  const { currentPage, scrapedData, failedUrls } = checkpoint;
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for (let i = currentPage; i <= lastPageValue; i++) {
    try {
      await page.goto(url + `?page=${i}`);
      if (i == 1) {
        const value = await lastPageValueFuc(page);
        lastPageValue = Math.ceil(value);
      }
      await page.waitForSelector(".js-product-link");

      const hrefValues = await page.evaluate(() => {
        const anchorElements = document.querySelectorAll(".js-product-link");
        const values = Array.from(anchorElements).map((element) =>
          element.getAttribute("href")
        );
        return values;
      });
      console.log("Check all:", hrefValues);

      for (let j = 0; j < hrefValues.length; j++) {
        const url = hrefValues[j];
        if (checkpoint.failedUrls.includes(url)) {
          console.log(`Skipping failed URL: ${url}`);
          continue;
        }

        try {
          const data = await scrapeWebsite(url, page);
          scrapedData.push(data);
          console.log("Scraped data:", data);
        } catch (error) {
          console.error("Error scraping website:", error);
          failedUrls.push(url); // Add the failed URL to the array
        }
      }

      checkpoint.currentPage = i + 1;
      checkpoint.scrapedData = scrapedData;
      checkpoint.failedUrls = failedUrls;
      await saveCheckpoint(checkpoint);
      console.log("Checkpoint saved.");

      console.log("Final scraped data:", scrapedData);
    } catch (error) {
      console.error("Error navigating to page:", error);
      await saveCheckpoint(checkpoint);
      console.log("Checkpoint saved.");
    }
  }

  await browser.close();
  await fs.promises.unlink(checkpointFile); // Remove the checkpoint file after completion
}

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

    console.log("Scraped data:", productInfo, compatibilityData);

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
    tableRows.each(async (index, row) => {
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

      // Save compatibility data to MongoDB
      try {
        const compatibility = new compatibilityData(document);
        await compatibility.save();
        console.log("Saved compatibility data:", document);
      } catch (error) {
        console.error("Error saving compatibility data:", error);
      }
    });
  });

  return data.length;
}

async function lastPageValueFuc(page) {
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
}

scrapeMultiplePages(URL);
