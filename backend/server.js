const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const parkingDataRoutes = require("./routes/parkingRoutes");
const occupancyDataRoutes = require("./routes/occupancyRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

app.use("/api/parkingData", parkingDataRoutes);
app.use("/api/occupancy", occupancyDataRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
