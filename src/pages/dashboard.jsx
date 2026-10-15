
import { useNavigate } from "react-router-dom";

function Dashboard() {

  // Permite navegar entre páginas
  const navigate = useNavigate();

  // Obtener los datos del usuario guardado
  const usuario = JSON.parse(
    localStorage.getItem("sigoUsuario")
  );

  // Función para cerrar sesión
  const cerrarSesion = () => {

    // Eliminar la sesión guardada
    localStorage.removeItem("sigoUsuario");

    // Regresar al inicio de sesión
    navigate("/");
  };

  return (
    <div className="tarjeta">

      <h2>Bienvenido, {usuario?.nombre}</h2>

      <p>Has iniciado sesión correctamente.</p>

      <p>Rol: {usuario?.rol}</p>

      <button onClick={cerrarSesion}>
        Cerrar sesión
      </button>

    </div>
  );
}

export default Dashboard;
