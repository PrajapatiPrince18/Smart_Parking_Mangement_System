const mongoose = require("mongoose");
const Slot = require("./models/Slot");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedSlots = async () => {
  try {
    await Slot.deleteMany(); // clear old
    const slots = [];
    for (let i = 1; i <= 10; i++) {
      slots.push({ slotNumber: i, status: "available" });
    }
    await Slot.insertMany(slots);
    console.log("✅ Slots seeded");
    mongoose.connection.close();
  } catch (err) {
    console.log("❌ Error:", err);
    mongoose.connection.close();
  }
};

seedSlots();
