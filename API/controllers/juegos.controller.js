// controllers/juegos.controller.js
const { Juego } = require("../conn");

// GET /juegos
async function listarJuegos(req, res, next) {
  try {
    const juegos = await Juego.find();
    res.json(juegos);
  } catch (err) {
    res.status(500).json({
      error: "Error al listar los juegos",
      detalle: err.message,
    });
  }
}

// POST /juegos
async function crearJuego(req, res, next) {
  try {
    const { titulo, genero, anio } = req.body;

    if (!titulo || !genero || !anio) {
      return res.status(400).json({
        error: "Datos inválidos",
        detalle: "Se requiere titulo, genero y anio",
      });
    }

    const nuevoJuego = new Juego(req.body);
    await nuevoJuego.save();
    res.status(201).json(nuevoJuego);
  } catch (err) {
    res.status(500).json({
      error: "Error al crear el juego",
      detalle: err.message,
    });
  }
}

// POST /juegos-many
async function crearMuchosJuegos(req, res, next) {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        error: "Datos inválidos",
        detalle: "Debes enviar un arreglo de juegos",
      });
    }

    const juegos = await Juego.insertMany(req.body);
    res.status(201).json(juegos);
  } catch (err) {
    res.status(500).json({
      error: "Error al crear múltiples juegos",
      detalle: err.message,
    });
  }
}

// DELETE /juegos/:id
async function borrarJuego(req, res, next) {
  try {
    const { id } = req.params;
    const borrado = await Juego.findByIdAndDelete(id);

    if (!borrado) {
      return res.status(404).json({
        error: "Juego no encontrado",
        detalle: `No existe un juego con id ${id}`,
      });
    }

    res.status(200).json({
      mensaje: "Juego eliminado correctamente",
      id,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar el juego",
      detalle: err.message,
    });
  }
}

module.exports = {
  listarJuegos,
  crearJuego,
  crearMuchosJuegos,
  borrarJuego,
};
