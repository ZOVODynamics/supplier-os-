const express = require("express");
const cors = require("cors");
require("dotenv").config({ quiet: true });

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ZOVO Supplier AI backend running ⚡" });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`ZOVO API running on port ${port}`);
  });
}

module.exports = app;
