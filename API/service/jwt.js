// service/jwt.js
const jwt = require("jwt-simple");

const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // expira en 1 día
  };

  return jwt.encode(payload, process.env.JWT_SECRET || "secreto");
};

module.exports = { generateToken };
