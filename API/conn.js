const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/blogdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Definimos el esquema para artículos del blog
const postSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    contenido: { type: String, required: true },
    autor: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    etiquetas: [String] // opcional, para categorías/tags
});

// Creamos el modelo basado en el esquema
const Post = mongoose.model('Post', postSchema);

module.exports = { Post };
