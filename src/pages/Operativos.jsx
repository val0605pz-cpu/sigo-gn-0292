
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable
} from "@hello-pangea/dnd";

const API = "http://localhost:4000";

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
  const [mensaje, setMensaje] = useState("");

  const [formulario, setFormulario] = useState({
    clave: "",
    nombre: "",
    tipo: "",
    unidadAsignada: "",
    prioridad: "Media"
  });

  // Recuperar el rol del usuario
  
  
const usuario = JSON.parse(
  localStorage.getItem("sigoUsuario") || "null"
);

const rol = usuario?.rol || "";

  // Consultar operativos
  async function cargarOperativos() {
    try {
      const respuesta = await fetch(`${API}/operativos`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los operativos");
      }

      const datos = await respuesta.json();
      setOperativos(datos);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargarOperativos();
  }, []);

  // Actualizar los datos del formulario
  function cambiarCampo(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  }

  // Crear un operativo
  async function crearOperativo(e) {
    e.preventDefault();
    setError("");
    setMensaje("");

    try {
      const respuesta = await fetch(`${API}/operativos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-rol": rol
        },
        body: JSON.stringify(formulario)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje);
      }

      setMensaje("Operativo creado correctamente");

      setFormulario({
        clave: "",
        nombre: "",
        tipo: "",
        unidadAsignada: "",
        prioridad: "Media"
      });

      await cargarOperativos();
    } catch (err) {
      setError(err.message);
    }
  }

  // Arrastrar y soltar una tarjeta
  async function terminarArrastre(resultado) {
    const { source, destination, draggableId } = resultado;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const nuevoEstado = destination.droppableId;
    const anteriores = [...operativos];

    setError("");
    setMensaje("");

    // Mover visualmente la tarjeta
    setOperativos(actuales =>
      actuales.map(op =>
        op.clave === draggableId
          ? { ...op, estado: nuevoEstado }
          : op
      )
    );

    try {
      const respuesta = await fetch(
        `${API}/operativos/${draggableId}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-rol": rol
          },
          body: JSON.stringify({ estado: nuevoEstado })
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje);
      }

      setMensaje("Estado actualizado correctamente");
      await cargarOperativos();

    } catch (err) {
      // Regresar la tarjeta a su columna original
      setOperativos(anteriores);
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: "25px" }}>
      <h1 style={{ color: "#7e22ce" }}>
        💜 Gestor de Operativos
      </h1>

      <p>Administración de procesos mediante tablero Kanban</p>

      <form
        onSubmit={crearOperativo}
        style={{
          background: "#f3e8ff",
          padding: "20px",
          borderRadius: "15px",
          marginTop: "20px",
          marginBottom: "25px"
        }}
      >
        <h2 style={{ color: "#6b21a8" }}>
          Crear nuevo operativo
        </h2>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <input
            name="clave"
            placeholder="OP-0292-001"
            value={formulario.clave}
            onChange={cambiarCampo}
            required
            pattern="OP-0292-[0-9]{3}"
          />

          <input
            name="nombre"
            placeholder="Nombre del operativo"
            value={formulario.nombre}
            onChange={cambiarCampo}
            required
          />

          <input
            name="tipo"
            placeholder="Tipo de operativo"
            value={formulario.tipo}
            onChange={cambiarCampo}
            required
          />

          <input
            name="unidadAsignada"
            placeholder="Unidad asignada"
            value={formulario.unidadAsignada}
            onChange={cambiarCampo}
            required
          />

          <select
            name="prioridad"
            value={formulario.prioridad}
            onChange={cambiarCampo}
          >
            <option>Alta</option>
            <option>Media</option>
            <option>Baja</option>
          </select>

          <button
            type="submit"
            style={{
              background: "#9333ea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 18px",
              cursor: "pointer"
            }}
          >
            Crear operativo
          </button>
        </div>
      </form>

      {error && (
        <p style={{ color: "#dc2626" }}>{error}</p>
      )}

      {mensaje && (
        <p style={{ color: "#15803d" }}>{mensaje}</p>
      )}

      <DragDropContext onDragEnd={terminarArrastre}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(190px, 1fr))",
          gap: "12px",
          overflowX: "auto"
        }}>
          {estados.map(estado => (
            <Droppable droppableId={estado} key={estado}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: snapshot.isDraggingOver
                      ? "#ddd6fe"
                      : "#f3e8ff",
                    padding: "12px",
                    borderRadius: "12px",
                    minHeight: "350px"
                  }}
                >
                  <h3 style={{
                    color: "#6b21a8",
                    textAlign: "center"
                  }}>
                    {estado}
                  </h3>

                  {operativos
                    .filter(op => op.estado === estado)
                    .map((op, index) => (
                      <Draggable
                        key={op.clave}
                        draggableId={op.clave}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{
                              background: "white",
                              padding: "12px",
                              marginBottom: "10px",
                              borderRadius: "10px",
                              boxShadow: "0 2px 8px #0002",
                              border: dragSnapshot.isDragging
                                ? "2px solid #9333ea"
                                : "1px solid #e9d5ff",
                              ...dragProvided.draggableProps.style
                            }}
                          >
                            <strong>{op.clave}</strong>
                            <p>{op.nombre}</p>
                            <small>Tipo: {op.tipo}</small>
                            <p>
                              <small>Unidad: {op.unidadAsignada}</small>
                            </p>
                            <small>Prioridad: {op.prioridad}</small>
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Operativos;
