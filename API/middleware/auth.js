// middleware/auth.js
const jwt = require("jwt-simple");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ msg: "Acceso denegado" });

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET || "secreto");

    // Validar expiración manualmente
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ msg: "Token expirado" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: "Token inválido" });
  }
};

module.exports = auth;
