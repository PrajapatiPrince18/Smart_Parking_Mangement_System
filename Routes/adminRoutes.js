const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  deleteUser,
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getReportData,
  getReportDataByDate
} = require("../Controllers/adminController");

const authAdmin = require("../Middleware/authAdmin");

// ---------------- Admin Auth & Profile ----------------
router.post("/login", loginAdmin);
router.get("/profile", authAdmin, getAdminProfile);
router.put("/profile", authAdmin, updateAdminProfile);

// ---------------- Manage Users ----------------
router.get("/users", authAdmin, getAllUsers);
router.delete("/users/:id", authAdmin, deleteUser);

// ---------------- Dashboard Stats ----------------
router.get("/dashboard", authAdmin, getDashboardStats);

// ---------------- Manage Bookings ----------------
router.get("/bookings", authAdmin, getAllBookings);

// ✅ Updated route to match frontend call
router.put("/bookings/:id/status", authAdmin, updateBookingStatus);

// ---------------- Reports ----------------
router.get("/reports", authAdmin, getReportData);
router.get("/reports/date", authAdmin, getReportDataByDate);

module.exports = router;
