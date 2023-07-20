// const cheerio = require("cheerio");
// const axios = require("axios");
// const headers = {
//   server: "Apache",
//   "x-request-id": "ZLhnIWVSiifMeOYv8Rxz0AAAAbU",
//   "x-frame-options": "SAMEORIGIN",
//   "cache-control": "max-age=86400, public",
//   "content-type": "application/json",
//   "content-length": "343",
//   date: "Thu, 20 Jul 2023 15:06:59 GMT",
//   connection: "close",
//   vary: "Accept-Encoding",
//   "server-timing":
//     'cdn-cache; desc=HIT, edge; dur=1, dtSInfo;desc="0", dtRpid;desc="-1245436569", ak_p; desc="469407_1750514772_1019672462_38_13995_4_-_-";dur=1',
//   "set-cookie": [

//     ],
//   "strict-transport-security": "max-age=31536000",
// };
// async function scrapeWebsite() {
//   try {
//     const response = await axios.get(
//       "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=LS33-80582R&productLineCode=AZR&seourl=%2Fsuspension-steering-tire-and-wheel%2Fshock-strut%2Fp%2Fduralast-loaded-strut-assembly-ls33-80582r%2F761599_0_0&skuId=761599&year=",
//       { headers }
//     );
//     console.log("resssssss", response.headers);
//     console.log("data", response.data);
//     // Continue with scraping logic
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// scrapeWebsite();

// const puppeteer = require("puppeteer");

// (async () => {
//   try {
//     // Launch headless browser
//     const browser = await puppeteer.launch({ headless: false });
//     const page = await browser.newPage();
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36"
//     );
//     // Navigate to the URL
//     const url =
//       "https://www.autozone.com/suspension-steering-tire-and-wheel/shock-strut/p/duralast-loaded-strut-assembly-ls33-80582r/761599_0_0";
//     await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

//     // Get the response headers
//     const response = await page.waitForResponse(
//       (response) => response.url() === url
//     );
//     const headers = response.headers();

//     // Print the headers
//     console.log("Response Headers:");
//     for (const [key, value] of Object.entries(headers)) {
//       console.log(`${key}: ${value}`);
//     }

//     // Close the browser
//     await browser.close();
//   } catch (error) {
//     console.error("Error:", error);
//   }
// })();

const axios = require("axios");
const tough = require("tough-cookie");

async function setCookieHeader() {
  const cookieStr = `Set-Cookie:
  _abck=EE7137962D0C5E0DF3512BEA8D0320C2~-1~YAAQVLxWaKWtASmJAQAAGjJHdArcqGZ9RPxW7sDWP81zfNOZ7LfXo13Hzcbp9YNvDSnM3srTxSMZa86IPe1bpOzxJLLZyfGq8MILKa3Id31xLpo7DBoZ/NtQMKRZiZi/NMHo7n7ZvWWNiEnHmK+benEbYp5LEBN4ESp9RgmZWeyPZmNMMNnpuwgKku/7TcbsaWBxAUni40Bh8wtVFwBr5C3QKZvbioEdcyMak0n/O2hpb5++qecCJfsXO9w/MZ9R3NOPCQOaUE3SzO5dZGBOcfc3fGmfLepRvlZn7ofJ7lzzgqXT73VY8+E1C5aex5BQ4tox+K7n+DFMIv+M6KwLBSDQJ2b982aVJ2H0kPq7y3aRAYJW8dy96HiO0Iw0wQtZmBzazztHKimcpJNbrLcno1wD2//8f3JwAXGw~-1~-1~-1; Domain=.autozone.com; Path=/; Expires=Fri, 19 Jul 2024 17:09:30 GMT; Max-Age=31536000; Secure
  Set-Cookie:
  bm_sv=B428EE2D9B83BF5196F41A0A930D4C96~YAAQVLxWaKatASmJAQAAGjJHdBT7BUlhcNLbvjNT/pQn8uiKY4YBsgzw2DtPymzJVjB9ZTABPo/tSxFcoAqT7SEthdPTh7v9d463wdJTmiRQlF5FkBmwQCZvjWYB/q2JTFsJsW8zHQ4hz567iqD6qQ0DTa03Cp2bDhtkK1kRKzfjTefnAFLqAWds3A698lZTwdYweYbLOCFgCsWc7ZtLEqWDakUMJ0e6EZ/LKcsWNXRXYeUz8gOETlGP+xsHhKOp3ZU=~1; Domain=.autozone.com; Path=/; Expires=Thu, 20 Jul 2023 19:04:15 GMT; Max-Age=6885; Secure
  Set-Cookie:
  sbsd=0000000000e66236863d87cfdb6f7e056169bf53bb438572f1ba863ec23b6ec02b2c32b285b8bf4497-50ee-4fb1-8a54-48b45133f8b716925518701689846551; Secure; Domain=www.autozone.com; Path=/; HttpOnly; Max-Age=111600
  `;

  // Remove newlines from the string and replace multiple spaces with a single space
  const cleanedCookieStr = cookieStr.replace(/\n/g, "").replace(/\s+/g, " ");

  // Extract the part after "Set-Cookie:" and remove the leading space
  const cookieHeadersp = cleanedCookieStr
    .split("Set-Cookie:")
    .slice(1)
    .join(";")
    .trim();

  // console.log("chan", cookieHeadersp);

  // const cookieStr = `
  // "WWW-WS-ROUTE=ffffffff09c20e0c45525d5f4f58455e445a4a4216cf; Version=1; Path=/; Max-Age=1800; Secure; HttpOnly; SameSite=None",
  // "_abck=EE7137962D0C5E0DF3512BEA8D0320C2~0~YAAQVLxWaCjcACmJAQAA4C7mcwo8RlxUrmMbdYggorE4cwP+Bqk/wqG9nsW1OqxV17AnMPIhoYND+/tkQlffRfuyYhwjYDhvuvCSSTgGKidYSG0lZ7t827jk6fRmrZzqQxYRug332lf0cQYcTGrFpaXCNNnDJK+MECdTR5MyBQuwvPSuuiur1uQTJ2LvFAGWH5WWNfHn/a+BTlKK4rCwNzwn3VBrHJW74GFsHMypwYnr5MQZtAcYhUP/7KZ68fyDoKcfPqcTxtrLMwi8xGPp8vXSVLDL1qJ+wplUnVjI4DGv4Bg0EHCC4AAT+52CUeG7SqaAeqeyDHvNFYYHyEz58iU4tDFRlcLDjzgATwJxMlJPOwKYQ7bcw7KQ+D19aDIlWKqGIz6muyWWpuIK5p4QYFIDmGi1pi0g5tI=~-1~-1~-1; Domain=.autozone.com; Path=/; Expires=Fri, 19 Jul 2024 15:23:32 GMT; Max-Age=31536000; Secure",
  // "bm_sv=260539E9524F9AEF7E0792C1ED160124~YAAQVLxWaCncACmJAQAA4C7mcxQp5tb78qOERiB42/p94vmrVvPyrnOcZjJhhsoztkxpj2A/PEwA9WXHCzi7FxxSn1DTRp1kSLLaQDrUdc8DgPOULz9FBTvgZeVbQ/Q6K/22zHDa6EziYKBoyaRM/BvZE9yoXdS6Y+fJZIPltsCw1CughRcxmVJAzXA9tIxRTeBCJnmZLsPL+Wr9ia5nBGn1Hu+CAOh/ihl37/ersB5grhZmYnJlGJVY3XTj5W+tiMfM~1; Domain=.autozone.com; Path=/; Expires=Thu, 20 Jul 2023 16:46:34 GMT; Max-Age=4982; Secure",
  // "sbsd=00000000004db31fb2d6836124458a5769db9a8ff630c8eaead79ba3cfc09117e0880d598db8bf4497-50ee-4fb1-8a54-48b45133f8b716925455111689846551; Secure; Domain=www.autozone.com; Path=/; HttpOnly; Max-Age=111600"
  // `;

  // Split the cookies by newlines and clean up any leading/trailing whitespace
  const cookies = cookieHeadersp
    .trim()
    .split("\n")
    .map((cookie) => cookie.trim());

  // Parse and format the cookies using tough-cookie
  const cookieJar = new tough.CookieJar();
  await Promise.all(
    cookies.map((cookie) =>
      cookieJar.setCookie(
        cookie,
        "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=LS53-90631R&productLineCode=AZR&seourl=%2Fsuspension-steering-tire-and-wheel%2Fshock-strut%2Fp%2Fduralast-loaded-strut-assembly-ls53-90631r%2F759775_0_0&skuId=759775&year="
      )
    )
  );

  // Get the cookies in the proper format
  const cookieHeader = await cookieJar.getCookieString(
    "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=LS53-90631R&productLineCode=AZR&seourl=%2Fsuspension-steering-tire-and-wheel%2Fshock-strut%2Fp%2Fduralast-loaded-strut-assembly-ls53-90631r%2F759775_0_0&skuId=759775&year="
  );
  console.log("headerrrrrrrrrrrrrrrr", cookieHeader);

  // Make the Axios request with the cookie header
  try {
    const response = await axios.get(
      "https://www.autozone.com/ecomm/b2c/v1/browse/page/getProductFitVehicles?make=&model=&partNumber=LS53-90631R&productLineCode=AZR&seourl=%2Fsuspension-steering-tire-and-wheel%2Fshock-strut%2Fp%2Fduralast-loaded-strut-assembly-ls53-90631r%2F759775_0_0&skuId=759775&year=",
      {
        headers: {
          Cookie: cookieHeader,
        },
      }
    );
    console.log(response.data);
    // The response headers will be logged here
  } catch (error) {
    console.error("Error fetching header response:", error.message);
  }
}

setCookieHeader();
