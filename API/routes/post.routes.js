const { Router } = require("express");
const {
  listarPosts,
  obtenerPost,
  crearPost,
  crearMuchosPosts,
  actualizarPost,
  borrarPost,
} = require("../controllers/posts.controller");
const { upload } = require("../middlewares/upload"); // <-- NUEVO

const router = Router();

router.get("/", listarPosts);
router.get("/:id", obtenerPost);

// Para crear con imagen (campo form-data: "imagen")
router.post("/", upload.single("imagen"), crearPost);

// Para crear muchos SIN imagen (o podrías armar otra estrategia por item)
router.post("/many", crearMuchosPosts);

// Actualizar con opción de nueva imagen (campo "imagen")
router.put("/:id", upload.single("imagen"), actualizarPost);

router.delete("/:id", borrarPost);

module.exports = router;
