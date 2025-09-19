// controllers/posts.controller.js
const { Post } = require("../conn");
const validator = require("validator");

// GET /posts  (opcional: ?page=1&limit=20&q=texto)
async function listarPosts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const q = (req.query.q || "").trim();

    // Filtro de búsqueda simple por título, contenido o etiquetas
    const filter = q
      ? {
          $or: [
            { titulo: { $regex: q, $options: "i" } },
            { contenido: { $regex: q, $options: "i" } },
            { etiquetas: { $elemMatch: { $regex: q, $options: "i" } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ fecha: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al listar los posts",
      detalle: err.message,
    });
  }
}

// GET /posts/:id
async function obtenerPost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        error: "Post no encontrado",
        detalle: `No existe un post con id ${id}`,
      });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({
      error: "Error al obtener el post",
      detalle: err.message,
    });
  }
}

// POST /posts
async function crearPost(req, res) {
  try {
    const { titulo, contenido, autor, etiquetas } = req.body;

    if (!titulo || !contenido || !autor) {
      return res.status(400).json({
        error: "Datos inválidos",
        detalle: "Se requiere titulo, contenido y autor",
      });
    }

    if (validator.isEmpty(titulo || "")) {
      return res
        .status(400)
        .json({
          error: "Datos inválidos",
          detalle: "El título no puede estar vacío",
        });
    }
    if (validator.isEmpty(contenido || "")) {
      return res
        .status(400)
        .json({
          error: "Datos inválidos",
          detalle: "El contenido no puede estar vacío",
        });
    }
    if (validator.isEmpty(autor || "")) {
      return res
        .status(400)
        .json({
          error: "Datos inválidos",
          detalle: "El autor no puede estar vacío",
        });
    }

    if (etiquetas && !Array.isArray(etiquetas)) {
      return res
        .status(400)
        .json({
          error: "Formato inválido",
          detalle: "etiquetas debe ser un arreglo de strings",
        });
    }
    if (Array.isArray(etiquetas)) {
      for (const et of etiquetas) {
        if (validator.isEmpty(et || "")) {
          return res
            .status(400)
            .json({
              error: "Formato inválido",
              detalle: "Cada etiqueta debe ser un string no vacío",
            });
        }
      }
    }

    // Si viene archivo (multer lo coloca en req.file)
    let imagen_url = null,
      imagen_mime = null,
      imagen_nom = null;
    if (req.file) {
      imagen_url = `/uploads/${req.file.filename}`;
      imagen_mime = req.file.mimetype;
      imagen_nom = req.file.originalname;
    }

    const nuevoPost = new Post({
      titulo,
      contenido,
      autor,
      etiquetas: Array.isArray(etiquetas) ? etiquetas : [],
      imagen_url,
      imagen_mime,
      imagen_nom,
    });

    await nuevoPost.save();
    res.status(201).json(nuevoPost);
  } catch (err) {
    res.status(500).json({
      error: "Error al crear el post",
      detalle: err.message,
    });
  }
}

// POST /posts-many
async function crearMuchosPosts(req, res) {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        error: "Datos inválidos",
        detalle: "Debes enviar un arreglo de posts",
      });
    }

    // Validación mínima por item
    for (const p of req.body) {
      if (!p.titulo || !p.contenido || !p.autor) {
        return res.status(400).json({
          error: "Datos inválidos en el lote",
          detalle: "Cada post requiere titulo, contenido y autor",
        });
      }
      if (p.etiquetas && !Array.isArray(p.etiquetas)) {
        return res.status(400).json({
          error: "Formato inválido",
          detalle: "etiquetas debe ser un arreglo de strings",
        });
      }
    }

    const posts = await Post.insertMany(
      req.body.map((p) => ({
        titulo: p.titulo,
        contenido: p.contenido,
        autor: p.autor,
        etiquetas: Array.isArray(p.etiquetas) ? p.etiquetas : [],
        fecha: p.fecha, // opcional; si no viene, el schema pone Date.now
      }))
    );

    res.status(201).json(posts);
  } catch (err) {
    res.status(500).json({
      error: "Error al crear múltiples posts",
      detalle: err.message,
    });
  }
}

// PUT /posts/:id
async function actualizarPost(req, res) {
  try {
    const { id } = req.params;
    const { titulo, contenido, autor, etiquetas, borrar_imagen } = req.body;

    const datos = {};
    if (titulo !== undefined) datos.titulo = titulo;
    if (contenido !== undefined) datos.contenido = contenido;
    if (autor !== undefined) datos.autor = autor;
    if (etiquetas !== undefined) {
      if (!Array.isArray(etiquetas)) {
        return res.status(400).json({
          error: "Formato inválido",
          detalle: "etiquetas debe ser un arreglo",
        });
      }
      datos.etiquetas = etiquetas;
    }

    // Si suben nueva imagen, reemplazamos campos
    if (req.file) {
      datos.imagen_url = `/uploads/${req.file.filename}`;
      datos.imagen_mime = req.file.mimetype;
      datos.imagen_nom = req.file.originalname;
    }

    // Permite borrar imagen enviando borrar_imagen=true
    if (borrar_imagen === "true" || borrar_imagen === true) {
      datos.imagen_url = null;
      datos.imagen_mime = null;
      datos.imagen_nom = null;
    }

    const actualizado = await Post.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
    });

    if (!actualizado) {
      return res.status(404).json({
        error: "Post no encontrado",
        detalle: `No existe un post con id ${id}`,
      });
    }

    res.json(actualizado);
  } catch (err) {
    res.status(500).json({
      error: "Error al actualizar el post",
      detalle: err.message,
    });
  }
}

// DELETE /posts/:id
async function borrarPost(req, res) {
  try {
    const { id } = req.params;
    const borrado = await Post.findByIdAndDelete(id);

    if (!borrado) {
      return res.status(404).json({
        error: "Post no encontrado",
        detalle: `No existe un post con id ${id}`,
      });
    }

    res.status(200).json({
      mensaje: "Post eliminado correctamente",
      id,
    });
  } catch (err) {
    res.status(500).json({
      error: "Error al eliminar el post",
      detalle: err.message,
    });
  }
}

module.exports = {
  listarPosts,
  obtenerPost,
  crearPost,
  crearMuchosPosts,
  actualizarPost,
  borrarPost,
};
