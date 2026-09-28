const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Diagnostic Booking API is running",
  });
});

app.use("/api", routes);

module.exports = app;