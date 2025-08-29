// server.js
const express = require("express");
const cors = require("cors");
const juegosRouter = require("./routes/juegos.routes");
// si tu conn.js inicializa la conexión a Mongo, con importarlo basta
require("./conn");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas base
app.get("/", (_req, res) => res.send("Hello World!"));

// Opción A (recomendada): montar router bajo /juegos
app.use("/juegos", juegosRouter);

// Opción B (si querés mantener /juegos-many exactamente igual):
// const { crearMuchosJuegos } = require("./controllers/juegos.controller");
// app.post("/juegos-many", crearMuchosJuegos);

// Middleware simple de errores (para no tronar feo)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error del servidor", detalle: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server corriendo en puerto ${PORT}`));
