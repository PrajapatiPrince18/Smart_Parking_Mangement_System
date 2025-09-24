const { Admin } = require('../Models/Admin');
const User = require('../Models/User');
const Booking = require('../Models/Booking');
const Slot = require('../Models/Slot');
const bcrypt = require('bcryptjs');
const generateToken = require('../Utils/generateToken');

// ✅ Helper: Auto-complete past bookings & free slots
const autoCompletePastBookings = async () => {
  try {
    const now = new Date();
    const bookings = await Booking.find({
      bookingDate: { $lt: now },
      status: "booked"
    }).populate("slot");

    for (let booking of bookings) {
      booking.status = "completed";
      await booking.save();

      if (booking.slot) {
        const slot = await Slot.findById(booking.slot._id);
        if (slot) {
          slot.status = "available";
          await slot.save();
        }
      }
    }
  } catch (err) {
    console.error("❌ Error auto-completing past bookings:", err);
  }
};

// ======================================================
// 🚀 Admin Login
// ======================================================
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error("❌ Admin login error:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ======================================================
// 🚀 Get / Update Admin Profile
// ======================================================
const getAdminProfile = async (req, res) => {
  if (!req.admin) return res.status(404).json({ message: 'Admin not found' });
  res.json(req.admin);
};

const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    if (req.body.password) {
      admin.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedAdmin = await admin.save();
    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
    });
  } catch (error) {
    console.error("❌ Update admin profile error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ======================================================
// 🚀 Manage Users
// ======================================================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // ✅ includes name, email, mobile
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Get users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// ======================================================
// 🚀 Admin Dashboard Stats
// ======================================================
const getDashboardStats = async (req, res) => {
  try {
    await autoCompletePastBookings();

    const totalUsers = await User.countDocuments();
    const totalSlots = await Slot.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: "booked" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email mobile") // ✅ mobile added
      .populate("slot", "slotNumber");

    res.json({
      totalUsers,
      totalSlots,
      activeBookings,
      cancelledBookings,
      recentBookings,
    });
  } catch (error) {
    console.error("❌ Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

// ======================================================
// 🚀 Manage Bookings
// ======================================================
const getAllBookings = async (req, res) => {
  try {
    await autoCompletePastBookings();

    const bookings = await Booking.find()
      .populate("user", "name email mobile") // ✅ mobile added
      .populate("slot", "slotNumber");

    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!["cancelled", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(bookingId).populate("slot");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    if (booking.slot) {
      const slot = await Slot.findById(booking.slot._id);
      if (slot) {
        slot.status = "available";
        await slot.save();
      }
    }

    res.status(200).json({ message: "Booking status & slot updated", booking });
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

// ======================================================
// 🚀 Admin Reports (All Data)
// ======================================================
const getReportData = async (req, res) => {
  try {
    await autoCompletePastBookings();

    const totalUsers = await User.countDocuments();
    const totalSlots = await Slot.countDocuments();

    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingStats = { booked: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => { bookingStats[b._id] = b.count; });

    const bookingsList = await Booking.find()
      .populate("user", "name email mobile") // ✅ mobile added
      .populate("slot", "slotNumber")
      .select("vehicleNumber bookingDate bookingTime status user slot");

    res.json({
      users: totalUsers,
      slots: totalSlots,
      bookings: bookingStats,
      bookingsList,
    });
  } catch (err) {
    console.error("❌ Error fetching report data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// 🚀 Admin Reports with Date Filter
// ======================================================
const getReportDataByDate = async (req, res) => {
  try {
    await autoCompletePastBookings();

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const bookings = await Booking.aggregate([
      {
        $match: { bookingDate: { $gte: start, $lte: end } }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const bookingStats = { booked: 0, completed: 0, cancelled: 0 };
    bookings.forEach(b => { bookingStats[b._id] = b.count; });

    const bookingsList = await Booking.find({ bookingDate: { $gte: start, $lte: end } })
      .populate("user", "name email mobile") // ✅ mobile added
      .populate("slot", "slotNumber")
      .select("vehicleNumber bookingDate bookingTime status user slot");

    res.json({
      users: await User.countDocuments(),
      slots: await Slot.countDocuments(),
      bookings: bookingStats,
      bookingsList,
    });
  } catch (err) {
    console.error("❌ Error fetching filtered report data:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
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
};
