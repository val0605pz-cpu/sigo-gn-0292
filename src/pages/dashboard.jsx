
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const usuario = JSON.parse(
    localStorage.getItem("sigoUsuario")
  );

  const cerrarSesion = () => {
    localStorage.removeItem("sigoUsuario");
    navigate("/");
  };

  const abrirExpedientes = () => {
    navigate("/expedientes");
  };

  return (
    <div className="tarjeta">

      <h2>Bienvenido, {usuario?.nombre} </h2>

      <p>Panel de Control de Acceso SIGO-GN</p>

      <div className="info-sesion">
        <h3>Información de la sesión</h3>

        <p><strong>Usuario:</strong> {usuario?.usuario}</p>

        <p><strong>Nombre:</strong> {usuario?.nombre}</p>

        <p><strong>Rol:</strong> {usuario?.rol}</p>

        <p>
          <strong>Estado:</strong> Sesión activa 🟢
        </p>
      </div>

      {/* Módulo de expedientes */}
      <div className="info-sesion">

        <h3>📁 Módulo de Expedientes</h3>

        <p>
          Consulta, registra, modifica y elimina
          expedientes de operativos.
        </p>

        <button
          onClick={abrirExpedientes}
          style={{
            background: "#8549b8",
            color: "white",
            padding: "14px 25px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            marginBottom: "15px"
          }}
        >
          📁 Abrir Expedientes
        </button>

      </div>

      <button onClick={cerrarSesion}>
        Cerrar sesión
      </button>

    </div>
  );
}

export default Dashboard;
