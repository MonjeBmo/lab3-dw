import React, { useEffect, useMemo, useState } from "react";
import "../App.css";

const API = "http://localhost:4000";

function logout() {
  localStorage.removeItem("token");
  window.location.reload(); // reinicia al login
}

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    Authorization: `Bearer ${token}`,
  };
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // UI: búsqueda, filtro por autor, orden
  const [q, setQ] = useState("");
  const [autor, setAutor] = useState("todos");
  const [orden, setOrden] = useState("recientes");

  // FORM/MODAL
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // post o null

  // Campos del form
  const [fTitulo, setFTitulo] = useState("");
  const [fContenido, setFContenido] = useState("");
  const [fAutor, setFAutor] = useState("");
  const [fEtiquetas, setFEtiquetas] = useState(""); // coma-separadas
  const [fImagen, setFImagen] = useState(null); // File
  const [fPreview, setFPreview] = useState(null); // URL local
  const [fBorrarImg, setFBorrarImg] = useState(false);

  // Cargar posts
  async function loadPosts() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fetch(`${API}/posts`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPosts(data.items || data || []);
    } catch (e) {
      setErr(e.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  // autores únicos
  const autores = useMemo(() => {
    const a = Array.from(new Set(posts.map((p) => p.autor).filter(Boolean)));
    return a.sort((x, y) => x.localeCompare(y));
  }, [posts]);

  // lista visible
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
      list.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
    } else if (orden === "antiguos") {
      list.sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0));
    } else {
      list.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    }

    return list;
  }, [posts, q, autor, orden]);

  // === Form helpers ===
  function openCreate() {
    setEditing(null);
    setFTitulo("");
    setFContenido("");
    setFAutor("");
    setFEtiquetas("");
    setFImagen(null);
    setFPreview(null);
    setFBorrarImg(false);
    setShowForm(true);
  }

  function openEdit(post) {
    setEditing(post);
    setFTitulo(post.titulo || "");
    setFContenido(post.contenido || "");
    setFAutor(post.autor || "");
    setFEtiquetas((post.etiquetas || []).join(", "));
    setFImagen(null);
    setFPreview(post.imagen_url ? `${API}${post.imagen_url}` : null);
    setFBorrarImg(false);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    // limpiar file
    setFImagen(null);
    setFPreview(null);
    setFBorrarImg(false);
  }

  function onPickFile(e) {
    const file = e.target.files?.[0] || null;
    setFImagen(file);
    if (file) {
      setFPreview(URL.createObjectURL(file));
      setFBorrarImg(false); // si elige nueva, no borrar
    } else {
      setFPreview(editing?.imagen_url ? `${API}${editing.imagen_url}` : null);
    }
  }

  // Crear/Actualizar
  async function handleSubmit(e) {
    e.preventDefault();

    // Etiquetas limpias
    const etiquetas = fEtiquetas
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // Armamos FormData SIEMPRE (así soporta archivo y texto)
    const fd = new FormData();
    fd.append("titulo", fTitulo);
    fd.append("contenido", fContenido);
    fd.append("autor", fAutor);
    etiquetas.forEach((et) => fd.append("etiquetas[]", et)); // tu backend acepta arreglo
    if (fImagen) fd.append("imagen", fImagen);
    if (editing) fd.append("borrar_imagen", String(fBorrarImg)); // "true"/"false"

    try {
      let res;
      if (!editing) {
        // CREATE
        res = await fetch(`${API}/posts/`, {
          method: "POST",
          headers: authHeaders(), // 👈 aquí
          body: fd,
        });
      } else {
        // UPDATE
        res = await fetch(`${API}/posts/${editing._id}`, {
          method: "PUT",
          headers: authHeaders(), // 👈 aquí
          body: fd,
        });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadPosts();
      closeForm();
    } catch (e) {
      alert(`Púchica, se peló: ${e.message}`);
    }
  }

  // Eliminar
  async function handleDelete(post) {
    if (!window.confirm(`¿Seguro querés borrar "${post.titulo}"?`)) return;
    try {
      const res = await fetch(`${API}/posts/${post._id}`, {
        method: "DELETE",
        headers: authHeaders(), // 👈 aquí
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // optimista: quitamos local
      setPosts((prev) => prev.filter((x) => x._id !== post._id));
    } catch (e) {
      alert(`Clavo al borrar: ${e.message}`);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__content">
          <h1>Post</h1>
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

            <div className="toolbar">
              <select
                className="control"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
                <option value="alfabetico">Alfabético (A-Z)</option>
              </select>
              <button className="btn btn--new" onClick={openCreate}>
                + Nuevo post
              </button>
              <button className="btn btn--ghost" onClick={logout}>
                Salir
              </button>
            </div>
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
                    {/* Imagen (si hay) */}
                    {p.imagen_url ? (
                      <div className="thumb">
                        <img
                          src={`${API}${p.imagen_url}`}
                          alt={p.titulo}
                          loading="lazy"
                        />
                      </div>
                    ) : null}

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
                      {(p.contenido || "").substring(0, 160)}...
                    </p>

                    <p className="tags">{(p.etiquetas || []).join(", ")}</p>

                    <div className="actions">
                      <button
                        className="btn btn--ghost"
                        onClick={() => alert(`Detalles del post: ${p.titulo}`)}
                      >
                        Ver
                      </button>
                      <button
                        className="btn btn--ghost"
                        onClick={() => openEdit(p)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn--danger"
                        onClick={() => handleDelete(p)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {/* Modal/Form */}
      {showForm && (
        <div className="modal" onMouseDown={closeForm}>
          <div
            className="modal__panel"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal__head">
              <h3 className="modal__title">
                {editing ? "Editar post" : "Nuevo post"}
              </h3>
              <button
                className="iconbtn"
                onClick={closeForm}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <label className="label">
                <span>Título</span>
                <input
                  className="control control--input"
                  value={fTitulo}
                  onChange={(e) => setFTitulo(e.target.value)}
                  required
                />
              </label>

              <label className="label">
                <span>Contenido</span>
                <textarea
                  className="control"
                  rows={5}
                  value={fContenido}
                  onChange={(e) => setFContenido(e.target.value)}
                  required
                />
              </label>

              <label className="label">
                <span>Autor</span>
                <input
                  className="control control--input"
                  value={fAutor}
                  onChange={(e) => setFAutor(e.target.value)}
                  required
                />
              </label>

              <label className="label">
                <span>Etiquetas (separadas por coma)</span>
                <input
                  className="control control--input"
                  value={fEtiquetas}
                  onChange={(e) => setFEtiquetas(e.target.value)}
                  placeholder="blog, noticia, js"
                />
              </label>

              <div className="fileline">
                <label className="label filelabel">
                  <span>Imagen (opcional)</span>
                  <input type="file" accept="image/*" onChange={onPickFile} />
                </label>

                {fPreview && (
                  <div className="thumb thumb--small">
                    <img src={fPreview} alt="preview" />
                  </div>
                )}
              </div>

              {editing && (editing.imagen_url || fPreview) && (
                <label className="checkline">
                  <input
                    type="checkbox"
                    checked={fBorrarImg}
                    onChange={(e) => setFBorrarImg(e.target.checked)}
                    disabled={!!fImagen} // si ya seleccionó otra, no tiene sentido borrar
                  />
                  <span>Quitar imagen actual</span>
                </label>
              )}

              <div className="modal__foot">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={closeForm}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn">
                  {editing ? "Guardar cambios" : "Crear post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
