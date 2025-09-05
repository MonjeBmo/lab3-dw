const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/blogdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Definimos el esquema para artículos del blog
const postSchema = new mongoose.Schema({
  titulo:    { type: String, required: true },
  contenido: { type: String, required: true },
  autor:     { type: String, required: true },
  fecha:     { type: Date,   default: Date.now },
  etiquetas: [String],

  // NUEVO: info de imagen
  imagen_url:  { type: String, default: null },  // ej: "/uploads/1693943973_foto.png"
  imagen_mime: { type: String, default: null },  // ej: "image/png"
  imagen_nom:  { type: String, default: null },  // nombre original
});


// Creamos el modelo basado en el esquema
const Post = mongoose.model('Post', postSchema);

module.exports = { Post };
