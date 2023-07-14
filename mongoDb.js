// const mongoose = require("mongoose");
// const MONGODB =
//   "mongodb+srv://mageshwaran962:HdlSSHYowIBXEtOp@webcluster.ad1yerk.mongodb.net/?retryWrites=true&w=majority";
// mongoose
//   .connect(MONGODB, {
//     useNewUrlParser: true,
//   })
//   .then(() => {
//     console.log("MongoDB connected");
//     return server.listen({ port: 5000 });
//   })
//   .then((res) => {
//     console.log(`Server runs sucess ${res.url}`);
//   });

// const axios = require("axios");
// const headers = {
//   "content-type": "text/html;charset=UTF-8",
//   "x-oneagent-js-injection": "true",
//   "server-timing": 'dtRpid;desc="409880081", dtSInfo;desc="0"',
//   "cache-control": "no-store",
//   "content-language": "en-US",
//   "x-content-type-options": "nosniff",
//   "strict-transport-security": "max-age=31536000; includeSubDomains",
//   vary: "Accept-Encoding",
//   date: "Wed, 12 Jul 2023 07:10:46 GMT",
//   "transfer-encoding": "chunked",
//   connection: "close, Transfer-Encoding",
//   "set-cookie":""
// };
// const getProductDetail = async () => {
//   await axios
//     .get(
//       "https://www.oreillyauto.com/detail/c/masterpro-strut-assemblies/masterpro-strut-assembly/msa0/33gm1110?q=struts&pos=0"
//     )
//     .then(function (response) {
//       console.log("received response", response);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// };
// const getCompatibility = async () => {
//   await axios
//     .post(
//       "https://www.oreillyauto.com/product/compatible-makes",
//       { headers },
//       { lineCode: "MSA", itemNumber: "33GM1110" }
//     )
//     .then(function (response) {
//       console.log("received response", response);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// };
// const getCall = async () => {
//   await axios
//     .get("https://www.oreillyauto.com/menu/categories")
//     .then(function (response) {
//       console.log("received response", response.headers);
//     })
//     .catch(function (error) {
//       console.log(error);
//     });
// };
// // getCall();
// getProductDetail();
// // getCompatibility();
