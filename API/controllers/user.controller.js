// controllers/user.controller.js
const User = require("../models/users");
const bcrypt = require("bcrypt"); // ahora con bcrypt nativo
const { generateToken } = require("../service/jwt");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si ya existe el usuario
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "El correo ya está registrado" });

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = new User({ username, email, password: hashed });
    await user.save();

    res.json({
      msg: "Usuario creado",
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    // Comparar contraseñas
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Contraseña incorrecta" });

    res.json({
      msg: "Bienvenido",
      token: generateToken(user),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
