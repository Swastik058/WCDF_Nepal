const axios = require("axios");

module.exports = axios.create({
  baseURL: "https://dev.khalti.com/api/v2",
  headers: {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});
