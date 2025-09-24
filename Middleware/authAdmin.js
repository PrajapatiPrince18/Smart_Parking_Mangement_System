const jwt = require("jsonwebtoken");
const { Admin } = require("../Models/Admin");

const authAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // get token part
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

      // ✅ check if token belongs to admin
      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin) {
        return res.status(401).json({ message: "Not authorized, admin not found" });
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = authAdmin;
