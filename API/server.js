// server.js
const express = require("express");
const cors = require("cors");
const postsRouter = require("./routes/post.routes"); // 🚀 ahora usamos posts
const usersRouter = require("./routes/user.routes")
const authMiddle = require("./middleware/auth")
require("./conn");
const path = require("path");



const app = express();
app.use(cors());
app.use(express.json());

// Rutas base
app.get("/", (_req, res) => res.send("API de Blog funcionando 🚀"));

app.use("/users", usersRouter)
// Rutas de posts
app.use("/posts", authMiddle, postsRouter);
// sirve archivos estáticos de /uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware de manejo de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "Error del servidor",
    detalle: err.message,
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
