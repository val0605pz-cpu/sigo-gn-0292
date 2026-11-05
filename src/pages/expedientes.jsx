
import { useEffect, useState } from "react";
import "./Expedientes.css";

const API = "http://localhost:4000/expedientes";

const datosIniciales = {
  folio: "",
  nombre: "",
  tipo: "",
  zona: "",
  fecha: "",
  descripcion: ""
};

function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [formulario, setFormulario] = useState(datosIniciales);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Consultar los expedientes
  const cargarExpedientes = async () => {
    try {
      const respuesta = await fetch(API);
      if (!respuesta.ok) throw new Error("Error al consultar");
      const datos = await respuesta.json();
      setExpedientes(datos);
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
    }
  };

  useEffect(() => {
    cargarExpedientes();
  }, []);

  // Actualizar campos del formulario
  const cambiar = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  // Guardar o editar
  const guardar = async (e) => {
    e.preventDefault();

    if (!/^EXP-0292-\d{3}$/.test(formulario.folio)) {
      setMensaje("El folio debe tener formato EXP-0292-001");
      return;
    }

    try {
      const url = editando
        ? `${API}/${formulario.folio}`
        : API;

      const respuesta = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formulario)
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "Ocurrió un error");
        return;
      }

      setMensaje(datos.mensaje);
      setFormulario({ ...datosIniciales });
      setEditando(false);
      cargarExpedientes();
    } catch (error) {
      setMensaje("Error al guardar el expediente");
    }
  };

  // Cargar los datos para editar
  const editar = (expediente) => {
    setFormulario(expediente);
    setEditando(true);
    setMensaje("");
    window.scrollTo(0, 0);
  };

  // Eliminar expediente
  const eliminar = async (folio) => {
    if (!window.confirm("¿Deseas eliminar este expediente?")) {
      return;
    }

    try {
      const respuesta = await fetch(`${API}/${folio}`, {
        method: "DELETE"
      });

      const datos = await respuesta.json();
      setMensaje(datos.mensaje);
      cargarExpedientes();
    } catch (error) {
      setMensaje("Error al eliminar");
    }
  };

  return (
    <div className="expedientes-pagina">
      <h1>💜 Módulo de Expedientes</h1>
      <p>Sistema de Gestión de Operativos - SIGO GN</p>

      <div className="expedientes-tarjeta">
        <h2>
          {editando ? "Editar expediente" : "Nuevo expediente"}
        </h2>

        <form onSubmit={guardar} className="expedientes-formulario">

          <input
            name="folio"
            placeholder="EXP-0292-001"
            value={formulario.folio}
            onChange={cambiar}
            disabled={editando}
            required
          />

          <input
            name="nombre"
            placeholder="Nombre del operativo"
            value={formulario.nombre}
            onChange={cambiar}
            required
          />

          <input
            name="tipo"
            placeholder="Tipo de incidente"
            value={formulario.tipo}
            onChange={cambiar}
            required
          />

          <input
            name="zona"
            placeholder="Zona"
            value={formulario.zona}
            onChange={cambiar}
            required
          />

          <input
            type="date"
            name="fecha"
            value={formulario.fecha}
            onChange={cambiar}
            required
          />

          <textarea
            name="descripcion"
            placeholder="Descripción del incidente"
            value={formulario.descripcion}
            onChange={cambiar}
            required
          />

          <button type="submit">
            {editando ? "Guardar cambios" : "Crear expediente"}
          </button>

          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(false);
                setFormulario({ ...datosIniciales });
              }}
            >
              Cancelar
            </button>
          )}
        </form>

        {mensaje && <p className="expedientes-mensaje">{mensaje}</p>}
      </div>

      <div className="expedientes-tarjeta">
        <h2>Expedientes registrados</h2>

        <div className="expedientes-tabla-contenedor">
          <table className="expedientes-tabla">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Operativo</th>
                <th>Incidente</th>
                <th>Zona</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {expedientes.map((exp) => (
                <tr key={exp.folio}>
                  <td>{exp.folio}</td>
                  <td>{exp.nombre}</td>
                  <td>{exp.tipo}</td>
                  <td>{exp.zona}</td>
                  <td>{exp.fecha}</td>
                  <td>
                    <button onClick={() => editar(exp)}>
                      Editar
                    </button>

                    <button onClick={() => eliminar(exp.folio)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {expedientes.length === 0 && (
            <p>No hay expedientes registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Expedientes;
