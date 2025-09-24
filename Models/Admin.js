const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// ✅ Create default admin if none exists
async function createDefaultAdmin() {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: hashedPassword
      });
      await admin.save();
      console.log('✅ Default admin created: admin@example.com / admin123');
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (err) {
    console.error('❌ Error creating default admin:', err);
  }
}

module.exports = { Admin, createDefaultAdmin };
