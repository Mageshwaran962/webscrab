const axios = require("axios");
const tough = require("tough-cookie");
const db = require("./mongo");
const puppeteer = require("puppeteer");
async function setCookieHeader() {
  // const check = await getSetCookiesAndResponseHeaders();
  // const check = await getCall();
  const cookieStr = `Set-Cookie:
  WWW-WS-ROUTE=ffffffff09c20e0f45525d5f4f58455e445a4a421730; Version=1; Path=/; Max-Age=1800; Secure; HttpOnly; SameSite=None
  Set-Cookie:
  bm_sv=088452E2BB59E1FF69D3C99ECEF6CC1B~YAAQyXQsMWPeYmyJAQAAy8kOiRRXCen1bjPZLwjbA8LlCSEwx0wxPeiE38E+EVGnNCBdNonGCh/DhfA56Tgx7BVp4lbiObTqw0fkfl4YCFVdtc51btpce/vBHvl7uPuNj3orMX3dTaEI1la46NmdbMMkzwM3ndsSNVPuymh3EA5wF4ycloHEETb3DPStFh9qs3xIVjBseLxNwH/doUp7XK1m2G8HKORLeDA3lts3uKfCHMIB1fRNu9THKVHx5cH6Zre/~1; Domain=.autozone.com; Path=/; Expires=Mon, 24 Jul 2023 19:54:10 GMT; Max-Age=6855; Secure
  Set-Cookie:
  sbsd=0000000000d88c2180a4fd1076cf47938933944ecd1ef56c0f1beea0d80bf581913f5b326e5b869a43-41b8-490d-a9f8-7271fb45d14516929004941690221247; Secure; Domain=www.autozone.com; Path=/; HttpOnly; Max-Age=111600`;
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
    "https://www.autozone.com/suspension-steering-tire-and-wheel/shock-strut?searchText=struts";

  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    });
    const page = await browser.newPage();

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
