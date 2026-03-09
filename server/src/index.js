const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const dbConnect = require("./config/dbConnect");

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// ================== MIDDLEWARE ==================
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        process.env.ADMIN_CLIENT_URL,
        "http://localhost:3000",
        "http://localhost:5173",
      ].filter(Boolean);

      // Allow non-browser clients (no origin header) and configured frontends.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ================== DATABASE ==================
dbConnect();

// ================== ROUTES ==================
const authRoutes = require("./routes/AuthRoutes");
const donationRoutes = require("./routes/DonationRoutes");
const khaltiRoutes = require("./routes/khaltiRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const eventRoutes = require("./routes/EventRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/khalti", khaltiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);

// ================== DEFAULT ROUTE ==================
app.get("/", (req, res) => {
  res.send("WCDF NGO Backend is running!");
});

// ================== KHALTI TEST ROUTE ==================
app.get("/api/khalti/test", (req, res) => {
  res.json({
    message: "Khalti verification endpoint is accessible",
    timestamp: new Date().toISOString(),
    environment: {
      CLIENT_URL: process.env.CLIENT_URL,
      SERVER_URL: process.env.SERVER_URL,
      PORT: process.env.PORT,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
});

// ================== 404 HANDLER ==================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ================== GLOBAL ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ================== SERVER ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server is running on port ${PORT}`)
);
