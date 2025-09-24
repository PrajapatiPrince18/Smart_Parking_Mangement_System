const express = require("express");
const {
  bookSlot,
  cancelBooking,
  getMyBookings,
  getAllBookings,
} = require("../Controllers/bookingController");
const auth = require("../Middleware/auth");

const router = express.Router();

// User routes
router.post("/book", auth, bookSlot);
router.put("/:id/cancel", auth, cancelBooking);
router.get("/my", auth, getMyBookings);

// Admin route
router.get("/", auth, getAllBookings);

module.exports = router;
