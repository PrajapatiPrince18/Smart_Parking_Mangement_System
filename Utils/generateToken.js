const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role }, // include role
    process.env.JWT_SECRET || "secret",
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;
