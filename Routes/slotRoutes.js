// backend/routes/slotRoutes.js
const express = require("express");
const router = express.Router();
const Slot = require("../Models/Slot");
const authAdmin = require("../Middleware/authAdmin");

// --------------------- GET all slots (Public) ---------------------
router.get("/", async (req, res) => {
  try {
    const slots = await Slot.find().sort({ slotNumber: 1 });
    res.status(200).json(slots);
  } catch (error) {
    console.error("❌ Error fetching slots:", error);
    res.status(500).json({ message: "Error fetching slots" });
  }
});

// --------------------- POST create a new slot (Admin only) ---------------------
router.post("/", authAdmin, async (req, res) => {
  try {
    const { slotNumber, status } = req.body;
    if (!slotNumber) return res.status(400).json({ message: "Slot number is required" });

    const existing = await Slot.findOne({ slotNumber });
    if (existing) return res.status(400).json({ message: "Slot already exists" });

    const newSlot = new Slot({ slotNumber, status: status || "available" });
    await newSlot.save();

    res.status(201).json(newSlot);
  } catch (error) {
    console.error("❌ Error creating slot:", error);
    res.status(500).json({ message: "Error creating slot" });
  }
});

// --------------------- DELETE slot (Admin only) ---------------------
router.delete("/:id", authAdmin, async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting slot:", error);
    res.status(500).json({ message: "Error deleting slot" });
  }
});

// --------------------- PUT update slot status (Admin only) ---------------------
router.put("/:id", authAdmin, async (req, res) => {
  try {
    const { status, bookedBy } = req.body;

    const slot = await Slot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    slot.status = status || slot.status;
    slot.bookedBy = bookedBy || null;

    await slot.save();
    res.status(200).json(slot);
  } catch (error) {
    console.error("❌ Error updating slot:", error);
    res.status(500).json({ message: "Error updating slot" });
  }
});

module.exports = router;
