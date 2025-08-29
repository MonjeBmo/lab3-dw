import logo from './logo.svg';
import './App.css';
import React, {use, useEffect,useState} from 'react';

function App() {
  
  const [juego, juegoSet ] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/juegos')
      .then(response => response.json())
      .then(data => juegoSet(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);
  
  return (
    <div>
      <h1>Lista de Juegos</h1>
      <ul>
        {juego.map(j => (
          <li key={j._id}>{j.titulo} - {j.genero} - {j.anio}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
