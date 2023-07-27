const axios = require("axios");
const tough = require("tough-cookie");
const db = require("./mongo");
const puppeteer = require("puppeteer");
async function setCookieHeader() {
  // const check = await getSetCookiesAndResponseHeaders();
  // const check = await getCall();
  const cookieStr = `Set-Cookie:
  bm_sv=F623D23F938BFFD92D556B514C2E234B~YAAQpJcwF+MI8YaJAQAAX4lGjRTZHVFfv33BkRtFCT6DYHm0spheDWRdOg6DWJiFbCDhEF0X2SOxnquQYL+NBzjVtZ/pK5J5nlVSXg+Pfi9Zh9MBeoeTZ7ydEqzNIldhfm8zMXBOJll4yxgCvblc27gzhVkLf3OaYyumwgMI/NaTjTBIJ9AkWp/GvgZOXynW0S2geSrcM7mx3uyxO0gh+tHADQViwGnvpxmABxanZRAcG8/g55KJ5/0dR028R8R/mjfSBHZU~1; Domain=.oreillyauto.com; Path=/; Expires=Tue, 25 Jul 2023 15:11:31 GMT; Max-Age=5534; Secure`;
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
  //   await db.connect();
  //   const sources = await db.source
  //     .aggregate([
  //       { $match: { isCompleted: false } },
  //       {
  //         $group: {
  //           _id: {
  //             itemId: "$itemId",
  //             lineCode: "$lineCode",
  //             partNumber: "$partNumber",
  //             productDetailsPageUrl: "$productDetailsPageUrl",
  //           },
  //         },
  //       },
  //     ])
  //     .toArray();
  const APIurl =
    "https://www.oreillyauto.com/shipping-estimate/line-code-item-numbers";
  //   const filteredArray = sources.slice(0, 20);
  const finalArray = [];

  // Parse and format the cookies using tough-cookie
  //   for (const url of filteredArray) {
  //     const filterSkuid = url._id.productDetailsPageUrl.split("/");
  //     const numberPart = filterSkuid[filterSkuid.length - 1];
  //     const numberOnly = numberPart.split("_")[0];
  //     const params = {
  //       partNumber: url._id.partNumber,
  //       productLineCode: url._id.lineCode,
  //       seourl: url._id.productDetailsPageUrl,
  //       skuId: numberOnly,
  //       year: "",
  //     };
  //     const urlChange = `${APIurl}${params.partNumber}&productLineCode=${
  //       params.productLineCode
  //     }&seourl=${encodeURIComponent(params.seourl)}&skuId=${params.skuId}&year=`;
  //     console.log("changed Url", urlChange);
  const cookieJar = new tough.CookieJar();
  await Promise.all(
    cookies.map((cookie) => cookieJar.setCookie(cookie, APIurl))
  );

  // Get the cookies in the proper format
  const cookieHeader = await cookieJar.getCookieString(APIurl);
  console.log("headerrrrrrrrrrrrrrrr", cookieHeader);

  // Make the Axios request with the cookie header
  // const headers = {
  //   Cookie: cookieHeader,
  //   // Add other headers if needed
  // };

  try {
    const response = await axios.post(
      APIurl,
      {
        lineCodeItemNumbers: [
          { lineCode: "MSA", itemNumber: "33GM1110" },
          { lineCode: "MSA", itemNumber: "33GM1120" },
          { lineCode: "MSA", itemNumber: "33GM1114" },
          { lineCode: "MON", itemNumber: 139105 },
          { lineCode: "MSA", itemNumber: "33FD1110" },
          { lineCode: "MSA", itemNumber: "33GM1115" },
          { lineCode: "MSA", itemNumber: "33GM1116" },
          { lineCode: "MSA", itemNumber: "34NS1145" },
          { lineCode: "MON", itemNumber: 172949 },
          { lineCode: "MON", itemNumber: 139104 },
          { lineCode: "MSA", itemNumber: "33CH1103" },
          { lineCode: "MSA", itemNumber: "34GM1131" },
          { lineCode: "MSA", itemNumber: "34NS1133" },
          { lineCode: "MSA", itemNumber: "34NS1141" },
          { lineCode: "MSA", itemNumber: "33GM1136" },
          { lineCode: "MSA", itemNumber: "33CH1112" },
          { lineCode: "MSA", itemNumber: "33FD1119" },
          { lineCode: "MSA", itemNumber: "33DG1104" },
          { lineCode: "MON", itemNumber: 172199 },
          { lineCode: "RAN", itemNumber: "RS999901" },
        ],
      },
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          Cookie: cookieHeader,
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9",
          "Content-Length": 64,
          "Content-Type": "application/json",
          Referer: "https://www.oreillyauto.com/search?q=struts",
          Origin: "https://www.oreillyauto.com",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Ch-Ua":
            '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
          "X-Csrf-Token": "NXOO-TNBS-XIFV-9BBA-OGTT-2519-Q4CQ-PCMI",
          "X-Dtpc": "4$91838590_849h7vVVUHDCKMCNECURNVPVWFEBEAIUMABBHA-0e0",
        },
      }
    );

    console.log("success", response);
    // The response headers will be logged here
    // finalArray.push(response.data);
    // console.log("length", finalArray.length);
  } catch (error) {
    console.error("Error fetching header response:", error.message);
  }
  //   }
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
