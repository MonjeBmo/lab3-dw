import { useState } from "react";

const API = "http://localhost:4000";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(null);

    try {
      const url = modo === "login" ? "/users/login" : "/users/register";
      const body =
        modo === "login"
          ? { email, password }
          : { username, email, password };

      const res = await fetch(`${API}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      localStorage.setItem("token", data.token);
      onLogin(); // ir al Blog
    } catch (e) {
      setErr("Error: " + e.message);
    }
  }

  return (
    <div className="page">
      <main className="container" style={{ maxWidth: 400 }}>
        <h2>{modo === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
        {err && <p style={{ color: "red" }}>{err}</p>}
        <form onSubmit={handleSubmit} className="form">
          {modo === "register" && (
            <label className="label">
              <span>Usuario</span>
              <input
                className="control"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>
          )}

          <label className="label">
            <span>Email</span>
            <input
              className="control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="label">
            <span>Contraseña</span>
            <input
              className="control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn">
            {modo === "login" ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <p style={{ marginTop: 12 }}>
          {modo === "login" ? (
            <>
              ¿No tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => setModo("register")}
                className="btn btn--ghost"
              >
                Registrarme
              </button>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{" "}
              <button
                type="button"
                onClick={() => setModo("login")}
                className="btn btn--ghost"
              >
                Iniciar sesión
              </button>
            </>
          )}
        </p>
      </main>
    </div>
  );
}
