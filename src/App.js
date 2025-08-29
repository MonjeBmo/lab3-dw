import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

export default function App() {
  const [juego, setJuego] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // UI: búsqueda, filtro, orden
  const [q, setQ] = useState("");
  const [genero, setGenero] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:4000/juegos");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setJuego(data || []);
      } catch (e) {
        setErr(e.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sacar géneros únicos para el <select>
  const generos = useMemo(() => {
    const g = Array.from(new Set(juego.map((j) => j.genero).filter(Boolean)));
    return g.sort((a, b) => a.localeCompare(b));
  }, [juego]);

  // Derivar lista visible según búsqueda/filtro/orden
  const visible = useMemo(() => {
    let list = [...juego];

    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (j) =>
          (j.titulo || "").toLowerCase().includes(term) ||
          (j.genero || "").toLowerCase().includes(term) ||
          String(j.anio || "").includes(term)
      );
    }

    if (genero !== "todos") {
      list = list.filter((j) => (j.genero || "").toLowerCase() === genero.toLowerCase());
    }

    if (orden === "recientes") {
      list.sort((a, b) => (b.anio || 0) - (a.anio || 0));
    } else if (orden === "antiguos") {
      list.sort((a, b) => (a.anio || 0) - (b.anio || 0));
    } else {
      list.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    }

    return list;
  }, [juego, q, genero, orden]);

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <h1>🎮 Colección de Juegos</h1>
          <p>Consulta rápida, filtros y vista bonita pa’ que no se mire feito.</p>

          <div className="controls">
            <input
              className="control control--input"
              placeholder="Buscar por título, género o año..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="control"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
            >
              <option value="todos">Todos los géneros</option>
              {generos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <select
              className="control"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="recientes">Más recientes</option>
              <option value="antiguos">Más antiguos</option>
              <option value="alfabetico">Alfabético (A-Z)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="container">
        {loading && (
          <ul className="grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="card skeleton">
                <div className="skeleton__title" />
                <div className="skeleton__row" />
                <div className="skeleton__row short" />
              </li>
            ))}
          </ul>
        )}

        {!loading && err && (
          <div className="alert alert--error">
            <strong>¡Púchica!</strong> No se pudo cargar: {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <div className="results">
              {visible.length} resultado{visible.length !== 1 ? "s" : ""}
            </div>

            {visible.length === 0 ? (
              <div className="empty">
                <span>😶‍🌫️</span>
                <p>No hay nada que coincida con tu búsqueda.</p>
              </div>
            ) : (
              <ul className="grid">
                {visible.map((j) => (
                  <li key={j._id} className="card">
                    <div className="card__header">
                      <h3 className="card__title">{j.titulo}</h3>
                      <span className="badge">{j.anio ?? "s/f"}</span>
                    </div>
                    <p className="muted">
                      Género: <strong>{j.genero || "—"}</strong>
                    </p>

                    {/* Si algún día agregás portada: j.portadaUrl */}
                    <div className="card__footer">
                      <button
                        className="btn"
                        onClick={() => alert(`Más info de: ${j.titulo}`)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {/* <footer className="footer">
        Hecho con cariño chapín 👊
      </footer> */}
    </div>
  );
}
