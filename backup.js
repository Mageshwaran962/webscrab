// const puppeteer = require("puppeteer");
// const mongoose = require("mongoose");
// const cheerio = require("cheerio");
// const productModel = require("./productModel");
// const compatibilityData = require("./compatibilityModel");
// const PORT = 5000;
// let pageCount = 1;
// let lastPageValue = 1;

// const state = {
//   lastScrapedURL: "", // Variable to store the last scraped URL
//   currentPage: 1, // Variable to store the current page number
//   browser: null, // Variable to store the browser instance
// };
// const MONGO_URL = "mongodb://localhost:27017/chat";
// const URL = "https://www.oreillyauto.com/shop/brands/a/masterpro-shocks/mss";
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

// async function scrapeWebsite(url, page) {
//   try {
//     await page.goto("https://www.oreillyauto.com/" + url);
//     // Get the HTML content after executing JavaScript

//     await page.evaluate(() => {
//       const elementToClick = document.querySelectorAll(".product-list_title");
//       elementToClick.forEach((element) => {
//         if (element.innerText.trim() === "Compatibility") {
//           element.click();
//         }
//       });
//     });
//     // Wait for the new component to appear
//     await page.waitForSelector(".compatibility-models");
//     await page.waitForSelector("button.open-vehicle-table");

//     // Click on the result element in the new component
//     await page.evaluate(() => {
//       const nissanButton = document.querySelectorAll(
//         "button.open-vehicle-table"
//       );
//       nissanButton.forEach((element) => {
//         element.click();
//       });
//     });
//     await page.waitForSelector("table.vehicles-table");

//     const updatedHTML = await page.evaluate(() => {
//       return document.documentElement.innerHTML;
//     });
//     // await browser.close();

//     // Continue with Cheerio for extracting product information
//     const $ = cheerio.load(updatedHTML);

//     // Extract product information using Cheerio
//     const productInfo = {};
//     const h1Element = $("h1.js-product-name");

//     const line = h1Element.attr("data-line");
//     const part = h1Element.attr("data-item");
//     const name = h1Element.text();
//     productInfo["name"] = name;
//     productInfo["part"] = part;
//     productInfo["line"] = line;
//     $(".product-list-details li").each(function () {
//       const label = $(this)
//         .find("span")
//         .text()
//         .replace(/<[^>]*>/g, "")
//         .replace(/\s+/g, " ")
//         .replace(/[\d:]+/g, "")
//         .trim();
//       const value = $(this)
//         .find("strong")
//         .text()
//         .replace(/<[^>]*>/g, "")
//         .replace(/\s+/g, " ")
//         .trim();

//       productInfo[label] = value;
//     });
//     const productInfoData = new productModel(productInfo);
//     await productInfoData.save();
//     const compatibilityData = await compatibilityMakes($, productInfo);

//     console.log("ssssssssssss", productInfo, compatibilityData);

//     return { productInfo, compatibilityData };
//   } catch (error) {
//     console.error("Error scraping website:", error);
//     throw error; // Re-throw the error to handle it in the calling function
//   }
// }
// async function compatibilityMakes($, info) {
//   const compatibilityModels = $(".compatibility-models");
//   const data = [];

//   compatibilityModels.each(async (index, model) => {
//     const make = $(model).find(".compatible-vehicle-name").text().trim();
//     const application = $(model).find(".pdp-comp_info").text().trim();

//     const tableRows = $(model).find(".vehicles-table tr");
//     const finalData = tableRows
//       .map(async (index, row) => {
//         const columns = $(row).find("td");
//         const [application, year] = columns.map((index, column) =>
//           $(column).text().trim()
//         );

//         const document = {
//           part: info.part,
//           make,
//           application,
//           year,
//         };
//         data.push(document);
//       })
//       .get();
//   });
//   try {
//     await compatibilityData.collection.insertMany(data);
//     return data.length;
//   } catch (error) {
//     console.error("Error saving compatibility data:", error);
//     return 0;
//   }
// }

// async function scrapeMultiplePages(url) {
//   const { lastScrapedURL, currentPage, browser } = state;
//   const scrapedData = [];
//   let page;

//   if (!browser) {
//     state.browser = await puppeteer.launch({ headless: false });
//     page = await state.browser.newPage();
//   } else {
//     page = await browser.newPage();
//   }

//   const failedUrls = []; // Array to store failed URLs

//   for (let i = currentPage; i <= lastPageValue; i++) {
//     try {
//       await page.goto(url + `?page=${i}`);
//       if (i === 1 && currentPage === 1) {
//         const value = await lastPageValueFuc(page);
//         state.lastPageValue = Math.ceil(value);
//       }
//       await page.waitForSelector(".js-product-link");

//       const hrefValues = await page.evaluate(() => {
//         const anchorElements = document.querySelectorAll(".js-product-link");
//         const values = Array.from(anchorElements).map((element) =>
//           element.getAttribute("href")
//         );
//         return values;
//       });
//       console.log("check all", hrefValues);

//       // Check if the last scraped URL exists in the current page's URLs
//       const lastIndex = hrefValues.indexOf(lastScrapedURL);
//       const urlsToScrape =
//         lastIndex === -1 ? hrefValues : hrefValues.slice(lastIndex + 1);

//       for (const url of urlsToScrape) {
//         try {
//           const data = await scrapeWebsite(url, page);
//           scrapedData.push(data);
//           state.lastScrapedURL = url; // Update the last scraped URL
//         } catch (error) {
//           console.error("Error scraping website:", error);
//           failedUrls.push(url); // Add the failed URL to the array
//         }
//       }
//       console.log("finallll", scrapedData);
//     } catch (error) {
//       console.error("Error navigating to page:", error);
//     }
//     state.currentPage = i + 1; // Update the current page number

//     if (failedUrls.length > 0) {
//       break; // Stop scraping if there are failed URLs
//     }
//   }

//   // Retry failed URLs
//   for (const url of failedUrls) {
//     try {
//       const data = await retryScrapeWebsite(url, page);
//       scrapedData.push(data);
//     } catch (error) {
//       console.error("Error retrying failed URL:", error);
//     }
//   }

//   // Check if there are any failed URLs and reopen the browser to continue from the last failed URL
//   if (failedUrls.length > 0 || state.currentPage <= lastPageValue) {
//     await page.close(); // Close the current page
//     await scrapeMultiplePages(url); // Call the function recursively to continue scraping
//   } else {
//     await state.browser.close(); // Close the browser if no failed URLs and all pages are scraped
//     state.browser = null; // Reset the browser instance
//     state.currentPage = 1; // Reset the current page number
//   }
// }

// async function retryScrapeWebsite(url, page) {
//   const maxRetries = 10; // Maximum number of retry attempts
//   let retries = 0;
//   while (retries < maxRetries) {
//     try {
//       const data = await scrapeWebsite(url, page);
//       return data;
//     } catch (error) {
//       console.error(
//         `Error retrying scrape for URL: ${url}, Retry: ${retries + 1}`,
//         error
//       );
//       retries++;
//     }
//   }
//   throw new Error(`Scrape for URL failed after ${maxRetries} attempts: ${url}`);
// }

// const lastPageValueFuc = async (page) => {
//   const strongValues = await page.evaluate(() => {
//     const strongElements = document.querySelectorAll(
//       ".plp-results-count strong"
//     );
//     const values = Array.from(strongElements).map((element) =>
//       element.textContent.trim()
//     );
//     return values;
//   });
//   return Number(strongValues[1]) / 24;
// };
// scrapeMultiplePages(URL);

const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const productModel = require("./productModel");
const compatibilityData = require("./compatibilityModel");
const PORT = 5000;
let pageCount = 1;
let lastPageValue = 1;
const StateModel = require("./stateModel");
const state = {
  lastScrapedURL: "", // Variable to store the last scraped URL
  currentPage: 1, // Variable to store the current page number
  browser: null, // Variable to store the browser instance
  lastPageValue: 1,
  urlArray: null,
};
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
    const existingProduct = await productModel.findOne({ part: part });
    if (existingProduct) {
      console.log("Product already exists. Skipping...");
      return null; // Return null to indicate that the product is skipped
    }
    const productInfoData = new productModel(productInfo);
    await productInfoData.save();
    const compatibilityData = await compatibilityMakes($, productInfo);

    console.log("ssssssssssss", productInfo, compatibilityData);

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
}

async function scrapeMultiplePages(url) {
  const { lastScrapedURL, currentPage, browser, lastPageValue } = state;
  const scrapedData = [];
  let page;
  console.log("ssssss", state, lastPageValue);
  if (!browser) {
    state.browser = await puppeteer.launch({ headless: false });
    page = await state.browser.newPage();
  } else {
    page = await browser.newPage();
  }

  const failedUrls = []; // Array to store failed URLs

  for (let i = currentPage; i <= lastPageValue; i++) {
    try {
      console.log("againsss", i);
      await page.goto(url + `?page=${i}`);
      if (i === 1 && currentPage === 1) {
        const value = await lastPageValueFuc(page);
        state.lastPageValue = Math.ceil(value);
      }
      await page.waitForSelector(".js-product-link");

      const hrefValues = await page.evaluate(() => {
        const anchorElements = document.querySelectorAll(".js-product-link");
        const values = Array.from(anchorElements).map((element) =>
          element.getAttribute("href")
        );
        return values;
      });

      console.log("check all", hrefValues);

      // Check if the last scraped URL exists in the current page's URLs
      const lastIndex = hrefValues.indexOf(lastScrapedURL);
      console.log("tttttttesssssst", lastIndex);
      const urlsToScrape =
        lastIndex === -1 ? hrefValues : hrefValues.slice(lastIndex + 1);
      console.log("tttttttesssssst2222", urlsToScrape);
      for (const url of urlsToScrape) {
        try {
          const data = await scrapeWebsite(url, page);
          scrapedData.push(data);
          state.lastScrapedURL = url; // Update the last scraped URL
          await saveState();
        } catch (error) {
          console.error("Error scraping website:", error);
          failedUrls.push(url); // Add the failed URL to the array
        }
      }
      console.log("finallll", scrapedData);
    } catch (error) {
      console.error("Error navigating to page:", error);
    }
    state.currentPage = i + 1; // Update the current page number
    console.log("sscureent page update", state);
    if (failedUrls.length > 0) {
      break; // Stop scraping if there are failed URLs
    }
  }

  // Retry failed URLs
  for (const url of failedUrls) {
    try {
      const data = await retryScrapeWebsite(url, page);
      scrapedData.push(data);
    } catch (error) {
      console.error("Error retrying failed URL:", error);
    }
  }

  // Check if there are any failed URLs and reopen the browser to continue from the last failed URL
  // if (failedUrls.length > 0 || state.currentPage <= lastPageValue) {
  //   await page.close(); // Close the current page
  //   await saveState(); // Save the scraping state
  //   await state.browser.close(); // Close the browser
  //   state.browser = null; // Reset the browser instance
  //   state.currentPage = 1; // Reset the current page number
  //   await resumeScraping(); // Resume scraping from the last saved state
  // } else {
  //   console.log("teeeeeeeeeeeeee");
  //   await state.browser.close(); // Close the browser if no failed URLs and all pages are scraped
  //   state.browser = null; // Reset the browser instance
  //   state.currentPage = 1; // Reset the current page number
  // }
}

async function retryScrapeWebsite(url, page) {
  const maxRetries = 10; // Maximum number of retry attempts
  const retryDelay = 5000; // Delay in milliseconds between retry attempts
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const data = await scrapeWebsite(url, page);
      return data;
    } catch (error) {
      console.error(
        `Error retrying scrape for URL: ${url}, Retry: ${retries + 1}`,
        error,
        state
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

async function saveState() {
  const { lastScrapedURL, currentPage, lastPageValue } = state;
  const stateData = { lastScrapedURL, currentPage, lastPageValue };

  try {
    // Save the state data to your MongoDB collection
    await StateModel.findOneAndUpdate({}, stateData, { upsert: true });
    console.log("State saved successfully");
  } catch (error) {
    console.error("Error saving state:", error);
  }
}

async function resumeScraping() {
  try {
    // Retrieve the saved state from your MongoDB collection
    const savedState = await StateModel.findOne();
    if (savedState) {
      state.lastScrapedURL = savedState.lastScrapedURL;
      state.currentPage = savedState.currentPage;
      state.lastPageValue = savedState.lastPageValue;
      console.log("Resuming scraping from last saved state");
    } else {
      console.log("No saved state found. Starting from the beginning.");
    }
  } catch (error) {
    console.error("Error retrieving saved state:", error);
  }
}

async function main() {
  // Call resumeScraping to check if there is a saved state and resume scraping
  await resumeScraping();
  // Start scraping from the initial URL
  await scrapeMultiplePages(URL);
}

main();

/// coookie approach
const axios = require("axios");
const tough = require("tough-cookie");

const db = require("./mongo");

async function setCookieHeader() {
  const cookieStr = `Set-Cookie:WWW-WS-ROUTE=ffffffff09c20e0f45525d5f4f58455e445a4a4216cf; Version=1; Path=/; Max-Age=1800; Secure; HttpOnly; SameSite=None
  Set-Cookie:_abck=EE7137962D0C5E0DF3512BEA8D0320C2~-1~YAAQbQHARbwqrmyJAQAA44NqdwoqSlHMewMywb6SB7gITC0LKps5qU5IVOEocgoEpAmKaPVb+3rwAXpHrc+ePgcrlhsaPerFukaVV6GYAdmex5QOxSXaYkTH/gr/fgcLDyth+ipz0JVTRGVNgXp6nzwNGJUT/D0udxFPBXNrerb23NPPGeSQUdUnn8tOc6Ep+NCJwQHKKJ7AC5oF0xBpmUtZvG7+lTyNa/oZ+Ap69QpPwyR2O2a5pzHAm7EIb8L2xwKNj19iiVXjzGw/NTmQpfs0llEKhKA8lQqYELf2H8qJ1iSQIygpLWJ5erQID8aJSbwSpj4fCCCWQWRmE4k8bLLiedPv5eLUcSnp96kXKmqGqaepcqvd7R5EfMdpNzxcjqAxPHcdk23LN42dNQZ+vdzw03Feo8GpnirC~-1~-1~-1; Domain=.autozone.com; Path=/; Expires=Sat, 20 Jul 2024 07:46:56 GMT; Max-Age=31536000; Secure
  Set-Cookie:bm_sv=BB05987A06B846FB92F8DE4078111D72~YAAQbQHARb0qrmyJAQAA44NqdxRbbsJ5kZiFv9XziP0mmVOATgF7n4ODSbCJYO1v26Ay4cDGHyHTDN3RgIkpnjTFGuuxYan/J4yhBisOp4NAiiD05Fd6RbFhAXlfUrmfaEWtR7VSkfwwhECkRk/VZs+qeX4av9SF608q1crcSrEaf0veHrbgQ2gvy3lhSx6w47Qc5tZK3ANIqCg2IZuaU0yut2rCbz8Q/mLGHTFG/CGNzTkLt6b2F7EJ0GL8Qlji9GB/~1; Domain=.autozone.com; Path=/; Expires=Fri, 21 Jul 2023 09:32:28 GMT; Max-Age=6332; Secure
  Set-Cookie:sbsd=000000000087db261cc631fc7dd382814fc94ad8e92fec53af742d01c08aebf88be3c16cb4b8bf4497-50ee-4fb1-8a54-48b45133f8b716926045161689846551; Secure; Domain=www.autozone.com; Path=/; HttpOnly; Max-Age=111600`;
  // Remove newlines from the string and replace multiple spaces with a single space
  // const cleanedCookieStr = cookieStr.replace(/\n/g, "").replace(/\s+/g, " ");

  // // Extract the part after "Set-Cookie:" and remove the leading space
  // const cookieHeadersp = cleanedCookieStr
  //   .split("Set-Cookie:")
  //   .slice(1)
  //   .join(";")
  //   .trim();
  const cookieStrings = cookieStr.match(/Set-Cookie:[^\n]+/g);
  const cookiess = cookieStrings.map((cookieString) =>
    cookieString.replace("Set-Cookie:", "").trim()
  );

  // Combine multiple cookie values into a single string
  const cookieHeaderValue = cookiess.join("; ");
  await db.connect();
  const sources = await db.source
    .aggregate([
      { $match: { isCompleted: false } },
      {
        $group: {
          _id: {
            itemId: "$itemId",
            lineCode: "$lineCode",
            partNumber: "$partNumber",
            productDetailsPageUrl: "$productDetailsPageUrl",
          },
        },
      },
    ])
    .toArray();
  // console.log("database", sources);
  // Split the cookies by newlines and clean up any leading/trailing whitespace
  const cookies = cookieHeaderValue
    .trim()
    .split("\n")
    .map((cookie) => cookie.trim());
  const APIurl =
    "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=";
  const filteredArray = sources.slice(0, 20);
  // Parse and format the cookies using tough-cookie
  // for (const url of filteredArray) {
  // const urlChange = `${APIurl}${url._id.partNumber}&productLineCode=${url._id.lineCode}&seourl=${url._id.productDetailsPageUrl}&year=`;
  // console.log("changed Url", urlChange);
  const cookieJar = new tough.CookieJar();
  await Promise.all(
    cookies.map((cookie) =>
      cookieJar.setCookie(
        cookie,
        "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=LS34-84501B&productLineCode=AZR&seourl=%2Fsuspension-steering-tire-and-wheel%2Fshock-strut%2Fp%2Fduralast-loaded-strut-assembly-ls34-84501b%2F762340_0_0&skuId=762340&year="
      )
    )
  );

  // Get the cookies in the proper format
  const cookieHeader = await cookieJar.getCookieString(
    "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=LS34-84501B&productLineCode=AZR&seourl=%2Fsuspension-steering-tire-and-wheel%2Fshock-strut%2Fp%2Fduralast-loaded-strut-assembly-ls34-84501b%2F762340_0_0&skuId=762340&year="
  );
  console.log("headerrrrrrrrrrrrrrrr", cookieHeader);

  // Make the Axios request with the cookie header
  try {
    const response = await axios.get(
      "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=LS34-84501B&productLineCode=AZR&seourl=%2Fsuspension-steering-tire-and-wheel%2Fshock-strut%2Fp%2Fduralast-loaded-strut-assembly-ls34-84501b%2F762340_0_0&skuId=762340&year=",
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );
    console.log("success", response.data);
    // The response headers will be logged here
  } catch (error) {
    console.error("Error fetching header response:", error.message);
  }
  // }
}

setCookieHeader();
