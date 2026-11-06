
import { useEffect, useState } from "react";

const estados = [
  "Nuevo",
  "Listo",
  "En ejecución",
  "Bloqueado",
  "Terminado"
];

function Operativos() {
  const [operativos, setOperativos] = useState([]);
  const [error, setError] = useState("");

  // Obtener los operativos del servidor
  useEffect(() => {
    fetch("http://localhost:4000/operativos")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar los operativos");
        }
        return respuesta.json();
      })
      .then((datos) => setOperativos(datos))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: "25px" }}>
      <h1 style={{ color: "#8b5cf6" }}>
        Gestor de Operativos
      </h1>

      <p>Administración de procesos mediante tablero Kanban</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(180px, 1fr))",
          gap: "15px",
          marginTop: "25px",
          overflowX: "auto"
        }}
      >
        {estados.map((estado) => (
          <div
            key={estado}
            style={{
              background: "#f3e8ff",
              borderRadius: "12px",
              padding: "15px",
              minHeight: "350px"
            }}
          >
            <h3 style={{ color: "#6b21a8" }}>{estado}</h3>

            {operativos
              .filter((op) => op.estado === estado)
              .map((op) => (
                <div
                  key={op.clave}
                  style={{
                    background: "white",
                    padding: "12px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 6px #0002"
                  }}
                >
                  <strong>{op.clave}</strong>
                  <p>{op.nombre}</p>
                  <small>Prioridad: {op.prioridad}</small>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Operativos;
