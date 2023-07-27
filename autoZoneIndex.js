const axios = require("axios");
const tough = require("tough-cookie");
const db = require("./mongo");
const puppeteer = require("puppeteer");
async function setCookieHeader() {
  const check = await getSetCookiesAndResponseHeaders();
  // const check = await getCall();
  const cookieStr = check;

  // console.log("ttt", cookieStr);
  const cleanedCookieStr = cookieStr.replace(/\n/g, "").replace(/\s+/g, " ");

  // Extract the part after "Set-Cookie:" and remove the leading space
  const cookieHeadersp = cleanedCookieStr
    .split("Set-Cookie:")
    .slice(1)
    .join(";")
    .trim();

  // console.log("chan", cookieHeadersp);

  // Split the cookies by newlines and clean up any leading/trailing whitespace
  const cookies = cookieHeadersp
    .trim()
    .split("\n")
    .map((cookie) => cookie.trim());
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
  const APIurl =
    "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=";
  const filteredArray = sources.slice(0, 20);
  const finalArray = [];

  // Parse and format the cookies using tough-cookie
  for (const url of filteredArray) {
    const filterSkuid = url._id.productDetailsPageUrl.split("/");
    const numberPart = filterSkuid[filterSkuid.length - 1];
    const numberOnly = numberPart.split("_")[0];
    const params = {
      partNumber: url._id.partNumber,
      productLineCode: url._id.lineCode,
      seourl: url._id.productDetailsPageUrl,
      skuId: numberOnly,
      year: "",
    };
    const urlChange = `${APIurl}${params.partNumber}&productLineCode=${
      params.productLineCode
    }&seourl=${encodeURIComponent(params.seourl)}&skuId=${params.skuId}&year=`;
    console.log("changed Url", urlChange);
    const cookieJar = new tough.CookieJar();
    await Promise.all(
      cookies.map((cookie) => cookieJar.setCookie(cookie, urlChange))
    );

    // Get the cookies in the proper format
    const cookieHeader = await cookieJar.getCookieString(urlChange);
    console.log("headerrrrrrrrrrrrrrrr", cookieHeader);

    // Make the Axios request with the cookie header
    // const headers = {
    //   Cookie: cookieHeader,
    //   // Add other headers if needed
    // };

    try {
      const response = await axios.get(urlChange, {
        headers: {
          Cookie: cookieHeader,
        },
      });

      // console.log("success", response);
      // The response headers will be logged here
      finalArray.push(response.data);
      console.log("length", finalArray.length);
    } catch (error) {
      console.error("Error fetching header response:", error.message);
    }
  }
}

setCookieHeader();

async function getSetCookiesAndResponseHeaders() {
  const urlArray = [];
  const url =
    "https://www.autozone.com/suspension-steering-tire-and-wheel/shock-strut/p/duralast-loaded-strut-assembly-ls33-80582r/761599_0_0";

  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );
    await page.setViewport({ width: 1536, height: 864 });
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9", // Simulate English language preference
      Referer: "https://www.google.com/", // Set a referring URL for navigation
    });
    // Intercept network responses to capture response headers
    page.on("response", (response) => {
      const url = response.url();
      if (
        url === "https://www.autozone.com/ecomm/b2c/v1/tvpage/info?skuId=761599"
      ) {
        const headers = response.headers();
        // console.log("Response Headers:");
        // console.log(headers);
        urlArray.push(headers["set-cookie"]);
      }
    });

    // Navigate to the URL
    await page.goto(url);

    // Click on the button to trigger navigation
    // await page.click('[data-testid="PDPFitment"]');

    // Wait for navigation to complete
    // await page.waitForNavigation({ waitUntil: "networkidle2" });

    const button = await page.waitForSelector(".az_vqb");
    const buttonBox = await button.boundingBox();
    const x = buttonBox.x + getRandomInt(5, buttonBox.width - 5);
    const y = buttonBox.y + getRandomInt(5, buttonBox.height - 5);
    await page.mouse.move(x, y, { steps: 20 });
    await page.waitForFunction(getRandomInt(500, 1000));
    await button.click();

    // Get the cookies from the page context
    const cookies = await page.evaluate(() => {
      return document.cookie;
    });

    // Parse the cookies and split them into an array
    const cookiesArray = cookies.split("; ");

    // Output the Set-Cookie headers
    // console.log("Set-Cookie Headers:");
    console.log(urlArray[0]);
    const individualCookies = urlArray[0].split("\n");

    // Create the Set-Cookie headers
    const setCookieHeaders = individualCookies.map(
      (cookie) => `Set-Cookie: ${cookie}`
    );

    console.log("final", setCookieHeaders.join());
    // Close the browser
    // await browser.close();
    const result = setCookieHeaders.join();
    return result;
  } catch (error) {
    console.error("Error:", error);
  }
}
// getSetCookiesAndResponseHeaders();
async function getCall() {
  try {
    const response = await axios.get(
      "https://www.autozone.com/ecomm/b2c/v1/browse/skus/price/762340,1196874,761351,760099,759775,761350?storeNumber=9801"
    );
    const result = response.headers;
    // const setCookieHeaders = result
    //   .map((cookie) => `Set-Cookie: ${cookie}`)
    //   .join();
    console.log("final resss", result);
    return result;
  } catch (err) {
    console.log(err);
  }
}
// getCall();

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
