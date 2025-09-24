const Booking = require("../Models/Booking");
const Slot = require("../Models/Slot");

// =============================
// @desc    Book a slot
// @route   POST /api/bookings/book
// @access  Private
// =============================
exports.bookSlot = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authorization denied. Please login." });
    }

    const { slotId, vehicleNumber, bookingDate, bookingTime } = req.body;

    if (!slotId || !vehicleNumber || !bookingDate || !bookingTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.status === "occupied") {
      return res.status(400).json({ message: "Slot is already occupied" });
    }

    const booking = await Booking.create({
      user: req.user.id,
      slot: slot._id,
      vehicleNumber,
      bookingDate,
      bookingTime,
      status: "booked",
    });

    slot.status = "occupied";
    slot.bookedBy = req.user.id;
    await slot.save();

    return res.status(201).json({
      success: true,
      message: "Slot booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// =============================
// @desc    Cancel a booking (only by owner or admin)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
// =============================
exports.cancelBooking = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authorization denied. Please login." });
    }

    const booking = await Booking.findById(req.params.id).populate("slot");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Allow cancel if user is owner or admin
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    booking.slot.status = "available";
    booking.slot.bookedBy = null;
    await booking.slot.save();

    return res.json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// =============================
// @desc    Get user booking history
// @route   GET /api/bookings/my
// @access  Private
// =============================
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authorization denied. Please login." });
    }

    const bookings = await Booking.find({ user: req.user.id })
      .populate("slot")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// =============================
// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
// =============================
exports.getAllBookings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("slot")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
