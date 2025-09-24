// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Routes
const userRoutes = require("./Routes/UserRoutes");
const slotRoutes = require("./Routes/slotRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const adminRoutes = require("./Routes/adminRoutes");

// Import createDefaultAdmin function
const { createDefaultAdmin } = require("./Models/Admin");

const app = express();

// --------------------- Middleware ---------------------
app.use(cors());
app.use(express.json());

// --------------------- API Routes ---------------------
app.use("/api/users", userRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// --------------------- Catch-all for unknown API routes ---------------------
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// --------------------- Serve React Frontend ---------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
} else {
  // Root route (for development mode)
  app.get("/", (req, res) => {
    res.send("Parking Slot Management API is running  (Development Mode)");
  });
}

// --------------------- Global Error Handler ---------------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Server Error" });
});

// --------------------- Start Server ---------------------
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");

    // Create default admin if not exists
    await createDefaultAdmin();

    // Start Express server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Start everything
startServer();
