const express = require('express');
const {Juego} = require('./conn');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/juegos', async (req, res) => {
    const juegos = await Juego.find();
    res.json(juegos);
});

app.post('/juegos', async (req, res) => {
    const nuevoJuego = new Juego(req.body);
    await nuevoJuego.save();
    res.status(201).json(nuevoJuego);
});




app.listen(4000, () => {
    console.log('Server is running on port 4000');
});



