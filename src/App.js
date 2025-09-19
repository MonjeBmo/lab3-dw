import { useState, useEffect } from "react";
import Login from "./components/Login";
import Blog from "./components/Blog";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // revisamos si ya hay token en localStorage
    const t = localStorage.getItem("token");
    if (t) setLoggedIn(true);
  }, []);

  return loggedIn ? (
    <Blog />
  ) : (
    <Login onLogin={() => setLoggedIn(true)} />
  );
}
