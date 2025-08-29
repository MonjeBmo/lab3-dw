// routes/juegos.routes.js
const { Router } = require("express");
const {
  listarJuegos,
  crearJuego,
  crearMuchosJuegos,
  borrarJuego,
} = require("../controllers/juegos.controller");

const router = Router();

// Base: /juegos
router.get("/", listarJuegos);
router.post("/", crearJuego);
router.post("/many", crearMuchosJuegos); // opcional: /juegos/many
router.delete("/:id", borrarJuego);

module.exports = router;
