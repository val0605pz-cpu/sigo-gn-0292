
import { Link, useNavigate, useLocation } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();

  // Obtener los datos del usuario que inició sesión
  const location = useLocation();

const usuario = JSON.parse(
  localStorage.getItem("sigoUsuario") || "null"
);
  

  // Cerrar sesión
  const cerrarSesion = () => {
    localStorage.removeItem("sigoUsuario");
    navigate("/");
  };

  return (
    <div className="layout">

      <header className="header">
        <h1>SIGO-GN · Unidad 92</h1>
        <p>Sistema de Gestión Operativa</p>
      </header>

      {/* Menú para usuarios que iniciaron sesión */}
      {usuario && (
        <nav className="menu-navegacion">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/expedientes">
            Expedientes
          </Link>

          {/* Solo el Comandante puede ver esta opción */}
          {usuario.rol === "Comandante" && (
            <Link to="/permisos">
              Roles y permisos
            </Link>
          )}

          <button type="button" onClick={cerrarSesion}>
            Cerrar sesión
          </button>

        </nav>
      )}

      <main className="contenido">
        {children}
      </main>

      <footer className="footer">
        <p>SIGO-GN | Sistemas Operativos</p>
      </footer>

    </div>
  );
}

export default Layout;
