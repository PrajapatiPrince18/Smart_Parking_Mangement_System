const Slot = require("../Models/Slot");

// ✅ Get all slots
const getAllSlots = async (req, res) => {
  try {
    const slots = await Slot.find().sort({ slotNumber: 1 });
    res.status(200).json(slots);
  } catch (error) {
    console.error("❌ Get slots error:", error);
    res.status(500).json({ message: "Error fetching slots" });
  }
};

// ✅ Add a new slot
const addSlot = async (req, res) => {
  try {
    const { slotNumber } = req.body;
    if (!slotNumber) return res.status(400).json({ message: "Slot number required" });

    // Check if slot already exists
    const existingSlot = await Slot.findOne({ slotNumber });
    if (existingSlot) return res.status(400).json({ message: "Slot already exists" });

    const slot = new Slot({ slotNumber });
    await slot.save();

    res.status(201).json({ message: "Slot added successfully", slot });
  } catch (error) {
    console.error("❌ Add slot error:", error);
    res.status(500).json({ message: "Error adding slot" });
  }
};

// ✅ Delete a slot
const deleteSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const deletedSlot = await Slot.findByIdAndDelete(slotId);

    if (!deletedSlot) return res.status(404).json({ message: "Slot not found" });

    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    console.error("❌ Delete slot error:", error);
    res.status(500).json({ message: "Error deleting slot" });
  }
};

// ✅ Update slot status
const updateSlotStatus = async (req, res) => {
  try {
    const slotId = req.params.id;
    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    // Toggle status between available and occupied
    slot.status = slot.status === "available" ? "occupied" : "available";
    await slot.save();

    res.status(200).json({ message: "Slot status updated", slot });
  } catch (error) {
    console.error("❌ Update slot status error:", error);
    res.status(500).json({ message: "Error updating slot status" });
  }
};

module.exports = {
  getAllSlots,
  addSlot,
  deleteSlot,
  updateSlotStatus,
};
