
import { useEffect, useState } from "react";
import "./Expedientes.css";
import { tienePermiso } from "../utils/permisos";
const API = "http://localhost:4000/expedientes";

const datosIniciales = {
  folio: "",
  nombre: "",
  tipo: "",
  zona: "",
  fecha: "",
  descripcion: "",
  estatus: "Abierto",
  prioridad: "Media"
};

function Expedientes() {
  // Obtener el usuario que inició sesión
const usuarioActual = JSON.parse(
  localStorage.getItem("sigoUsuario") || "null"
);

// Obtener su rol
const rol = usuarioActual?.rol || "";

// Verificar los permisos
const puedeLeer = tienePermiso(rol, 4);
const puedeEditar = tienePermiso(rol, 2);
const puedeEliminar = tienePermiso(rol, 1);
  const [expedientes, setExpedientes] = useState([]);
  const [formulario, setFormulario] = useState(datosIniciales);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  // Filtros de expedientes
const [filtroEstatus, setFiltroEstatus] = useState("");
const [filtroPrioridad, setFiltroPrioridad] = useState("");
// Controlar el ordenamiento de la tabla
const [ordenColumna, setOrdenColumna] = useState("folio");
const [ordenDireccion, setOrdenDireccion] = useState("asc");
// Página actual de la tabla
const [paginaActual, setPaginaActual] = useState(1);
// Cambiar el orden al hacer clic en una columna
const cambiarOrden = (columna) => {
  if (ordenColumna === columna) {
    setOrdenDireccion(
      ordenDireccion === "asc" ? "desc" : "asc"
    );
  } else {
    setOrdenColumna(columna);
    setOrdenDireccion("asc");
  }
};
// Aplicar filtros a los expedientes
const expedientesFiltrados = expedientes.filter((exp) => {
  const coincideEstatus =
    filtroEstatus === "" ||
    (exp.estatus || "Abierto") === filtroEstatus;

  const coincidePrioridad =
    filtroPrioridad === "" ||
    (exp.prioridad || "Media") === filtroPrioridad;

  return coincideEstatus && coincidePrioridad;
});

  // Ordenar una copia de los expedientes filtrados
  const expedientesOrdenados = [...expedientesFiltrados].sort((a, b) => {
    let resultado = 0;

    if (ordenColumna === "prioridad") {
      const niveles = { Alta: 1, Media: 2, Baja: 3 };

      const prioridadA = niveles[a.prioridad || "Media"];
      const prioridadB = niveles[b.prioridad || "Media"];

      resultado = prioridadA - prioridadB;
    } else {
      const valorA = String(a[ordenColumna] || "");
      const valorB = String(b[ordenColumna] || "");

      resultado = valorA.localeCompare(valorB);
    }

    return ordenDireccion === "asc" ? resultado : -resultado;
  });
  // Mostrar máximo 10 expedientes por página
const registrosPorPagina = 10;

const totalPaginas = Math.max(
  1,
  Math.ceil(expedientesOrdenados.length / registrosPorPagina)
);

const paginaVisible = Math.min(paginaActual, totalPaginas);

const expedientesPaginados = expedientesOrdenados.slice(
  (paginaVisible - 1) * registrosPorPagina,
  paginaVisible * registrosPorPagina
);


  // Consultar expedientes, con búsqueda opcional
  const cargarExpedientes = async (texto = "") => {
    try {
      const url = texto.trim()
        ? `${API}/buscar?texto=${encodeURIComponent(texto)}`
        : API;

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error("Error al consultar");
      }

      const datos = await respuesta.json();
      setExpedientes(datos);
    } catch (error) {
      setMensaje("No se pudo conectar con el servidor");
    }
  };

  // Buscar automáticamente mientras escribimos
  useEffect(() => {
    const temporizador = setTimeout(() => {
      cargarExpedientes(busqueda);
    }, 350);

    return () => clearTimeout(temporizador);
  }, [busqueda]);

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
    "Content-Type": "application/json",
    "x-rol": rol
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
      cargarExpedientes(busqueda);
    } catch (error) {
      setMensaje("Error al guardar el expediente");
    }
  };

  // Cargar datos para editar
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
  method: "DELETE",
  headers: {
    "x-rol": rol
  }
});


      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setMensaje(datos.mensaje || "Error al eliminar");
        return;
      }

      setMensaje(datos.mensaje);
      cargarExpedientes(busqueda);
    } catch (error) {
      setMensaje("Error al eliminar");
    }
  };

  return (
    <div className="expedientes-pagina">
      <h1> Módulo de Expedientes</h1>
      <p>Sistema de Gestión de Operativos - SIGO GN</p>
      {puedeEditar && (
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
          {/* Seleccionar estatus */}
<select
  name="estatus"
  value={formulario.estatus || "Abierto"}
  onChange={cambiar}
>
  <option value="Abierto">Abierto</option>
  <option value="En proceso">En proceso</option>
  <option value="Cerrado">Cerrado</option>
</select>

{/* Seleccionar prioridad */}
<select
  name="prioridad"
  value={formulario.prioridad || "Media"}
  onChange={cambiar}
>
  <option value="Alta">Alta</option>
  <option value="Media">Media</option>
  <option value="Baja">Baja</option>
</select>

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

        {mensaje && (
          <p className="expedientes-mensaje">{mensaje}</p>
        )}
      </div>
)}
      <div className="expedientes-tarjeta">
        <h2> Buscar expedientes</h2>

        <input
          type="text"
          placeholder="Buscar por folio, operativo o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "2px solid #c9a7eb",
            marginBottom: "15px",
            boxSizing: "border-box"
          }}
        />
        
{/* Filtros de búsqueda */}
<div style={{
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
  flexWrap: "wrap"
}}>
  <select
    value={filtroEstatus}
    onChange={(e) => setFiltroEstatus(e.target.value)}
  >
    <option value="">Todos los estatus</option>
    <option value="Abierto">Abierto</option>
    <option value="En proceso">En proceso</option>
    <option value="Cerrado">Cerrado</option>
  </select>

  <select
    value={filtroPrioridad}
    onChange={(e) => setFiltroPrioridad(e.target.value)}
  >
    <option value="">Todas las prioridades</option>
    <option value="Alta">Alta</option>
    <option value="Media">Media</option>
    <option value="Baja">Baja</option>
  </select>
</div>

        <h2>Expedientes registrados 0292</h2>

        <div className="expedientes-tabla-contenedor">
          <table className="expedientes-tabla">
            <thead>
  <tr>
    <th onClick={() => cambiarOrden("folio")} style={{ cursor: "pointer" }}>
  Folio ↕
</th>
    <th>Operativo</th>
    <th>Incidente</th>
    <th>Zona</th>
    <th>Fecha</th>
    <th onClick={() => cambiarOrden("fechaCreacion")} style={{ cursor: "pointer" }}>
  Fecha de creación ↕
</th>
    <th>Estatus</th>
    <th onClick={() => cambiarOrden("prioridad")} style={{ cursor: "pointer" }}>
  Prioridad ↕
</th>
{(puedeEditar || puedeEliminar) && (
  <th>Acciones</th>
)}
    </tr>
</thead>

            <tbody>
             {expedientesPaginados.map((exp) => ( 
                <tr key={exp.folio}>
                  <td>{exp.folio}</td>
                  <td>{exp.nombre}</td>
                  <td>{exp.tipo}</td>
                  <td>{exp.zona}</td>
                  <td>{exp.fecha}</td>
                  <td>{exp.fechaCreacion
  ? new Date(exp.fechaCreacion).toLocaleString("es-MX")
  : "Sin registro"}
</td>
                  <td>
  <span
    className={`estatus-${(exp.estatus || "Abierto")
      .toLowerCase()
      .replace(" ", "-")}`}
  >
    {exp.estatus || "Abierto"}
  </span>
</td>
                  <td>{exp.prioridad || "Media"}</td>
                  {(puedeEditar || puedeEliminar) && (
  <td>
    {puedeEditar && (
      <button onClick={() => editar(exp)}>
        Editar
      </button>
    )}

    {puedeEliminar && (
      <button onClick={() => eliminar(exp.folio)}>
        Eliminar
      </button>
    )}
  </td>
)}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Botones de paginación */}
<div className="paginacion">

  <button
    type="button"
    disabled={paginaVisible === 1}
    onClick={() => setPaginaActual(paginaVisible - 1)}
  >
    Anterior
  </button>

  <span>
    Página {paginaVisible} de {totalPaginas}
  </span>

  <button
    type="button"
    disabled={paginaVisible === totalPaginas}
    onClick={() => setPaginaActual(paginaVisible + 1)}
  >
    Siguiente
  </button>

</div>
          {expedientesFiltrados.length === 0 && (
            <p>No se encontraron expedientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Expedientes;
