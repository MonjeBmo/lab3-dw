const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/juegosdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const juegoSchema = new mongoose.Schema({
    titulo: String,
    genero: String,
    anio: Number
});

const Juego = mongoose.model('Juego', juegoSchema);

module.exports = { Juego };