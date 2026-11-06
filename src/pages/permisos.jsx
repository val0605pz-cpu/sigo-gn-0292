
import { Navigate } from "react-router-dom";

function Permisos() {
  // Obtener el usuario que inició sesión
  const usuario = JSON.parse(
    localStorage.getItem("sigoUsuario") || "null"
  );

  // Solo el Comandante puede entrar
  if (usuario?.rol !== "Comandante") {
    return <Navigate to="/dashboard" replace />;
  }

  const roles = [
    {
      nombre: "Comandante",
      octal: 7,
      simbolico: "rwx",
      permisos: "Ver, editar y eliminar"
    },
    {
      nombre: "Oficial",
      octal: 6,
      simbolico: "rw-",
      permisos: "Ver y editar"
    },
    {
      nombre: "Analista",
      octal: 4,
      simbolico: "r--",
      permisos: "Solo ver"
    }
  ];

  return (
    <div className="expedientes-pagina">
      <h1>Roles y permisos</h1>

      <p>
        Sistema de Gestión de Operativos - SIGO GN
      </p>

      <div className="expedientes-tarjeta">
        <h2>Tabla de permisos del sistema</h2>

        <div className="expedientes-tabla-contenedor">
          <table className="expedientes-tabla">
            <thead>
              <tr>
                <th>Rol</th>
                <th>Valor octal</th>
                <th>Representación simbólica</th>
                <th>Acciones permitidas</th>
              </tr>
            </thead>

            <tbody>
              {roles.map((rol) => (
                <tr key={rol.nombre}>
                  <td>{rol.nombre}</td>
                  <td>{rol.octal}</td>
                  <td>{rol.simbolico}</td>
                  <td>{rol.permisos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Permisos;
