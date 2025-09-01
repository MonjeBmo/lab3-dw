// routes/posts.routes.js
const { Router } = require("express");
const {
  listarPosts,
  obtenerPost,
  crearPost,
  crearMuchosPosts,
  actualizarPost,
  borrarPost,
} = require("../controllers/posts.controller");

const router = Router();

// Base: /posts
router.get("/", listarPosts);         // GET todos los posts (con búsqueda/paginación opcional)
router.get("/:id", obtenerPost);      // GET un post específico
router.post("/", crearPost);          // POST crear un post
router.post("/many", crearMuchosPosts); // POST crear muchos posts de un jalón
router.put("/:id", actualizarPost);   // PUT actualizar un post
router.delete("/:id", borrarPost);    // DELETE eliminar un post

module.exports = router;
