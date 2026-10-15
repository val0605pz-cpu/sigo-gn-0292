
import { Navigate } from "react-router-dom";

function RutaProtegida({ children }) {

  // Revisar si existe un usuario con sesión iniciada
  const usuario = localStorage.getItem("sigoUsuario");

  // Si no existe, regresar al Login
  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  // Si existe, permitir el acceso
  return children;
}

export default RutaProtegida;
