const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const adminAuthMiddleware = require("./middleware/adminAuthMiddleware");

dotenv.config();

/* ===== LOAD APP_CONFIG FROM RENDER SINGLE ENV ===== */
if (process.env.APP_CONFIG) {
  try {
    const parsedConfig = JSON.parse(process.env.APP_CONFIG);

    Object.keys(parsedConfig).forEach((key) => {
      process.env[key] = parsedConfig[key];
    });

    console.log("APP_CONFIG loaded successfully");
  } catch (error) {
    console.log("APP_CONFIG parse error:", error.message);
  }
}

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err.message));

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

// product routes
app.use("/api/products", require("./routes/productRoutes"));

// payment routes
app.use("/api/payment", require("./routes/paymentRoutes"));

// orders routes
app.use("/api/orders", require("./routes/orderRoutes"));

// track order routes
app.use("/api/track-order", require("./routes/trackOrderRoutes"));

// admin auth routes
app.use("/api/admin-auth", require("./routes/adminAuthRoutes"));

// protected admin routes
app.use("/api/admin", adminAuthMiddleware, require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});