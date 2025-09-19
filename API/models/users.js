// models/users.js
const mongoose = require("mongoose");
const { isEmail, isStrongPassword } = require("validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "El usuario es obligatorio"],
    minlength: [3, "Mínimo 3 caracteres"],
    maxlength: [20, "Máximo 20 caracteres"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "El correo no es válido"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "Mínimo 6 caracteres"],
    validate: {
      validator: (val) => isStrongPassword(val, { minSymbols: 0 }),
      message: "La contraseña debe ser más segura (mayús, minús, número).",
    },
  },
  bio: {
    type: String,
    maxlength: 150,
    default: "",
  },
  avatar: {
    type: String,
    default: "default.png",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
