import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

export default function App() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // UI: búsqueda, filtro por autor, orden
  const [q, setQ] = useState("");
  const [autor, setAutor] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:4000/posts");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // si el backend devuelve {items: [...]}, ajustamos
        setPosts(data.items || data || []);
      } catch (e) {
        setErr(e.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sacar autores únicos para el <select>
  const autores = useMemo(() => {
    const a = Array.from(new Set(posts.map((p) => p.autor).filter(Boolean)));
    return a.sort((x, y) => x.localeCompare(y));
  }, [posts]);

  // Derivar lista visible según búsqueda/filtro/orden
  const visible = useMemo(() => {
    let list = [...posts];

    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter(
        (p) =>
          (p.titulo || "").toLowerCase().includes(term) ||
          (p.contenido || "").toLowerCase().includes(term) ||
          (p.autor || "").toLowerCase().includes(term) ||
          (p.etiquetas || []).some((et) =>
            (et || "").toLowerCase().includes(term)
          )
      );
    }

    if (autor !== "todos") {
      list = list.filter(
        (p) => (p.autor || "").toLowerCase() === autor.toLowerCase()
      );
    }

    if (orden === "recientes") {
      list.sort(
        (a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)
      );
    } else if (orden === "antiguos") {
      list.sort(
        (a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0)
      );
    } else {
      list.sort((a, b) =>
        (a.titulo || "").localeCompare(b.titulo || "")
      );
    }

    return list;
  }, [posts, q, autor, orden]);

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <h1>Blog</h1>
          <p>Consulta rápida de artículos, con filtros y búsqueda.</p>

          <div className="controls">
            <input
              className="control control--input"
              placeholder="Buscar por título, contenido, autor o etiquetas..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="control"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            >
              <option value="todos">Todos los autores</option>
              {autores.map((a) => (
                <option key={a} value={a}>
                  {a}
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
            <strong>Error</strong> No se pudo cargar: {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <div className="results">
              {visible.length} resultado{visible.length !== 1 ? "s" : ""}
            </div>

            {visible.length === 0 ? (
              <div className="empty">
                <p>No hay publicaciones que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              <ul className="grid">
                {visible.map((p) => (
                  <li key={p._id} className="card">
                    <div className="card__header">
                      <h3 className="card__title">{p.titulo}</h3>
                      <span className="badge">
                        {p.fecha
                          ? new Date(p.fecha).toLocaleDateString()
                          : "s/f"}
                      </span>
                    </div>
                    <p className="muted">
                      Autor: <strong>{p.autor || "Desconocido"}</strong>
                    </p>
                    <p className="excerpt">
                      {(p.contenido || "").substring(0, 120)}...
                    </p>
                    <p className="tags">
                      {(p.etiquetas || []).join(", ")}
                    </p>
                    <div className="card__footer">
                      <button
                        className="btn"
                        onClick={() =>
                          alert(`Detalles del post: ${p.titulo}`)
                        }
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
    </div>
  );
}
