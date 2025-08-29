// controllers/juegos.controller.js
const { Juego } = require("../conn");

// GET /juegos
async function listarJuegos(req, res, next) {
  try {
    const juegos = await Juego.find();
    res.json(juegos);
  } catch (err) {
    next(err);
  }
}

// POST /juegos
async function crearJuego(req, res, next) {
  try {
    const nuevoJuego = new Juego(req.body);
    await nuevoJuego.save();
    res.status(201).json(nuevoJuego);
  } catch (err) {
    next(err);
  }
}

// POST /juegos-many
async function crearMuchosJuegos(req, res, next) {
  try {
    const juegos = await Juego.insertMany(req.body);
    res.status(201).json(juegos);
  } catch (err) {
    next(err);
  }
}

// DELETE /juegos/:id
async function borrarJuego(req, res, next) {
  try {
    const { id } = req.params;
    await Juego.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarJuegos,
  crearJuego,
  crearMuchosJuegos,
  borrarJuego,
};
