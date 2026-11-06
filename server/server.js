
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Permisos de cada rol
const permisosRoles = {
    Comandante: 7, // rwx
    Oficial: 6,    // rw-
    Analista: 4    // r--
};

// Verificar si el rol tiene permiso
function tienePermiso(rol, accion) {
    const permisos = permisosRoles[rol] || 0;

    return (permisos & accion) === accion;
}

// Revisar permisos antes de realizar una operación
function verificarPermiso(accion) {
    return (req, res, next) => {
        const rol = req.headers["x-rol"];

        if (!tienePermiso(rol, accion)) {
            return res.status(403).json({
                mensaje: "Acceso prohibido: no tienes permiso para realizar esta acción"
            });
        }

        next();
    };
}


// Carpeta donde guardaremos los expedientes
const carpeta = path.join(__dirname, "data", "expedientes");

// Consultar todos los expedientes
app.get("/expedientes", (req, res) => {
    const archivos = fs.readdirSync(carpeta);

    const expedientes = archivos
        .filter(archivo => archivo.endsWith(".json"))
        .map(archivo => {
            const contenido = fs.readFileSync(
                path.join(carpeta, archivo),
                "utf8"
            );

            return JSON.parse(contenido);
        });

    res.json(expedientes);
});

 // Crear un expediente nuevo
app.post("/expedientes", verificarPermiso(2), (req, res) => {
    const expediente = req.body;

    // Validar que tenga todos los datos
    const { folio, nombre, tipo, zona, fecha, descripcion } = expediente;

    if (!folio || !nombre || !tipo || !zona || !fecha || !descripcion) {
        return res.status(400).json({
            mensaje: "Debes llenar todos los campos"
        });
    }

    // Validar formato del folio
   if (!/^EXP-0292-\d{3}$/.test(folio)) {
        return res.status(400).json({
            mensaje: "El folio debe tener formato EXP-0292-001"
        });
    }

    const archivo = path.join(carpeta, folio + ".json");

    // Evitar expedientes repetidos
    if (fs.existsSync(archivo)) {
        return res.status(409).json({
            mensaje: "Este expediente ya existe"
        });
    }
    // Agregar metadatos al expediente
const estatusValidos = ["Abierto", "En proceso", "Cerrado"];
const prioridadesValidas = ["Alta", "Media", "Baja"];

if (!estatusValidos.includes(expediente.estatus) ||
    !prioridadesValidas.includes(expediente.prioridad)) {
    return res.status(400).json({
        mensaje: "Selecciona un estatus y una prioridad válidos"
    });
}

expediente.fechaCreacion = new Date().toISOString();
expediente.fechaModificacion = expediente.fechaCreacion;
    // Guardar el expediente
    fs.writeFileSync(
        archivo,
        JSON.stringify(expediente, null, 2)
    );

    res.status(201).json({
        mensaje: "Expediente guardado correctamente",
        expediente: expediente
    });
});

 // Buscar expedientes por folio, nombre o descripción
app.get("/expedientes/buscar", (req, res) => {
    const texto = (req.query.texto || "").toLowerCase();

    const archivos = fs.readdirSync(carpeta);

    const expedientes = archivos
        .filter(archivo => archivo.endsWith(".json"))
        .map(archivo => {
            const contenido = fs.readFileSync(
                path.join(carpeta, archivo),
                "utf8"
            );

            return JSON.parse(contenido);
        });

    const resultados = expedientes.filter(expediente =>
        (expediente.folio || "").toLowerCase().includes(texto) ||
        (expediente.nombre || "").toLowerCase().includes(texto) ||
        (expediente.descripcion || "").toLowerCase().includes(texto)
    );

    res.json(resultados);
});

 // Consultar un expediente por su folio
app.get("/expedientes/:folio", (req, res) => {
    const folio = req.params.folio;

    // Verificar que el folio sea válido
    if (!/^EXP-0292-\d{3}$/.test(folio)) {
        return res.status(400).json({
            mensaje: "Folio no válido"
        });
    }

    const archivo = path.join(carpeta, folio + ".json");

    // Verificar si existe
    if (!fs.existsSync(archivo)) {
        return res.status(404).json({
            mensaje: "Expediente no encontrado"
        });
    }

    // Leer el expediente
    const contenido = fs.readFileSync(archivo, "utf8");

    res.json(JSON.parse(contenido));
});

 // Actualizar un expediente
app.put("/expedientes/:folio", verificarPermiso(2), (req, res) => {
    const folio = req.params.folio;

    // Validar el folio
    if (!/^EXP-0292-\d{3}$/.test(folio)) {
        return res.status(400).json({
            mensaje: "Folio no válido"
        });
    }

    const archivo = path.join(carpeta, folio + ".json");

    // Verificar si existe
    if (!fs.existsSync(archivo)) {
        return res.status(404).json({
            mensaje: "Expediente no encontrado"
        });
    }

    // Recibir los datos actualizados
    const { nombre, tipo, zona, fecha, descripcion } = req.body;

    if (!nombre || !tipo || !zona || !fecha || !descripcion) {
        return res.status(400).json({
            mensaje: "Debes llenar todos los campos"
        });
    }

    
    // Recuperar los datos anteriores del expediente
    const anterior = JSON.parse(
        fs.readFileSync(archivo, "utf8")
    );

    // Validar los nuevos metadatos
    const estatus = req.body.estatus || anterior.estatus || "Abierto";
    const prioridad = req.body.prioridad || anterior.prioridad || "Media";

    if (!["Abierto", "En proceso", "Cerrado"].includes(estatus) ||
        !["Alta", "Media", "Baja"].includes(prioridad)) {
        return res.status(400).json({
            mensaje: "Estatus o prioridad no válidos"
        });
    }

    // Conservar la fecha de creación y actualizar la modificación
    const expediente = {
        folio,
        nombre,
        tipo,
        zona,
        fecha,
        descripcion,
        estatus,
        prioridad,
        fechaCreacion: anterior.fechaCreacion || new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
    };


    // Sobrescribir el archivo JSON
    fs.writeFileSync(
        archivo,
        JSON.stringify(expediente, null, 2)
    );

    res.json({
        mensaje: "Expediente actualizado correctamente",
        expediente: expediente
    });
});

 // Eliminar un expediente
app.delete("/expedientes/:folio", verificarPermiso(1), (req, res) => {
    const folio = req.params.folio;

    // Validar el folio
    if (!/^EXP-0292-\d{3}$/.test(folio)) {
        return res.status(400).json({
            mensaje: "Folio no válido"
        });
    }

    const archivo = path.join(carpeta, folio + ".json");

    // Verificar si existe
    if (!fs.existsSync(archivo)) {
        return res.status(404).json({
            mensaje: "Expediente no encontrado"
        });
    }

    // Eliminar físicamente el archivo
    fs.unlinkSync(archivo);

    res.json({
        mensaje: "Expediente eliminado correctamente"
    });
});

 // ==========================================
 // PRÁCTICA 06 - GESTOR DE OPERATIVOS
 // ==========================================

const carpetaOperativos = path.join(__dirname, "data", "operativos");

// Crear la carpeta si todavía no existe
if (!fs.existsSync(carpetaOperativos)) {
    fs.mkdirSync(carpetaOperativos, { recursive: true });
}

// Estados y prioridades permitidos
const estadosOperativos = [
    "Nuevo", "Listo", "En ejecución",
    "Bloqueado", "Terminado"
];

const prioridadesOperativos = ["Alta", "Media", "Baja"];

// Transiciones válidas entre estados
const transiciones = {
    "Nuevo": ["Listo"],
    "Listo": ["En ejecución"],
    "En ejecución": ["Bloqueado", "Terminado"],
    "Bloqueado": ["En ejecución"],
    "Terminado": []
};

// Validar la clave personalizada
function claveValida(clave) {
    return /^OP-0292-\d{3}$/.test(clave);
}

// Obtener la ruta del archivo JSON
function archivoOperativo(clave) {
    return path.join(carpetaOperativos, clave + ".json");
}

// GET - Consultar todos los operativos
app.get("/operativos", (req, res) => {
    const archivos = fs.readdirSync(carpetaOperativos);

    const operativos = archivos
        .filter(archivo => archivo.endsWith(".json"))
        .map(archivo => JSON.parse(
            fs.readFileSync(
                path.join(carpetaOperativos, archivo), "utf8"
            )
        ));

    res.json(operativos);
});

// GET - Consultar un operativo por clave
app.get("/operativos/:clave", (req, res) => {
    const clave = req.params.clave;

    if (!claveValida(clave)) {
        return res.status(400).json({ mensaje: "Clave no válida" });
    }

    const archivo = archivoOperativo(clave);

    if (!fs.existsSync(archivo)) {
        return res.status(404).json({
            mensaje: "Operativo no encontrado"
        });
    }

    res.json(JSON.parse(fs.readFileSync(archivo, "utf8")));
});

// POST - Crear un operativo
app.post("/operativos", verificarPermiso(2), (req, res) => {
    const { clave, nombre, tipo, unidadAsignada, prioridad } = req.body;

    if (!claveValida(clave)) {
        return res.status(400).json({
            mensaje: "La clave debe tener formato OP-0292-001"
        });
    }

    if (![nombre, tipo, unidadAsignada, prioridad].every(
        valor => typeof valor === "string" && valor.trim()
    )) {
        return res.status(400).json({
            mensaje: "Debes llenar todos los campos"
        });
    }

    if (!prioridadesOperativos.includes(prioridad)) {
        return res.status(400).json({
            mensaje: "Prioridad no válida"
        });
    }

    const archivo = archivoOperativo(clave);

    if (fs.existsSync(archivo)) {
        return res.status(409).json({
            mensaje: "El operativo ya existe"
        });
    }

    const operativo = {
        clave,
        nombre,
        tipo,
        unidadAsignada,
        estado: "Nuevo",
        prioridad,
        fechaCambioEstado: new Date().toISOString()
    };

    fs.writeFileSync(archivo, JSON.stringify(operativo, null, 2));

    res.status(201).json({
        mensaje: "Operativo creado correctamente",
        operativo
    });
});

// PUT - Actualizar datos del operativo
app.put("/operativos/:clave", verificarPermiso(2), (req, res) => {
    const clave = req.params.clave;

    if (!claveValida(clave)) {
        return res.status(400).json({ mensaje: "Clave no válida" });
    }

    const archivo = archivoOperativo(clave);

    if (!fs.existsSync(archivo)) {
        return res.status(404).json({
            mensaje: "Operativo no encontrado"
        });
    }

    const { nombre, tipo, unidadAsignada, prioridad } = req.body;

    if (![nombre, tipo, unidadAsignada, prioridad].every(
        valor => typeof valor === "string" && valor.trim()
    ) || !prioridadesOperativos.includes(prioridad)) {
        return res.status(400).json({
            mensaje: "Datos incompletos o prioridad no válida"
        });
    }

    const anterior = JSON.parse(fs.readFileSync(archivo, "utf8"));

    const operativo = {
        ...anterior,
        nombre,
        tipo,
        unidadAsignada,
        prioridad
    };

    fs.writeFileSync(archivo, JSON.stringify(operativo, null, 2));

    res.json({
        mensaje: "Operativo actualizado correctamente",
        operativo
    });
});

// PATCH - Cambiar únicamente el estado
app.patch("/operativos/:clave/estado", verificarPermiso(2), (req, res) => {
    const clave = req.params.clave;
    const { estado } = req.body;

    if (!claveValida(clave)) {
        return res.status(400).json({ mensaje: "Clave no válida" });
    }

    const archivo = archivoOperativo(clave);

    if (!fs.existsSync(archivo)) {
        return res.status(404).json({
            mensaje: "Operativo no encontrado"
        });
    }

    if (Object.keys(req.body).length !== 1 ||
        !estadosOperativos.includes(estado)) {
        return res.status(400).json({
            mensaje: "Debes enviar únicamente un estado válido"
        });
    }

    const operativo = JSON.parse(fs.readFileSync(archivo, "utf8"));

    if (!transiciones[operativo.estado]?.includes(estado)) {
        return res.status(400).json({
            mensaje: `No se permite pasar de ${operativo.estado} a ${estado}`
        });
    }

    operativo.estado = estado;
    operativo.fechaCambioEstado = new Date().toISOString();

    fs.writeFileSync(archivo, JSON.stringify(operativo, null, 2));

    res.json({
        mensaje: "Estado actualizado correctamente",
        operativo
    });
});

// DELETE - Eliminar un operativo
app.delete("/operativos/:clave", verificarPermiso(1), (req, res) => {
    const clave = req.params.clave;

    if (!claveValida(clave)) {
        return res.status(400).json({ mensaje: "Clave no válida" });
    }

    const archivo = archivoOperativo(clave);

    if (!fs.existsSync(archivo)) {
        return res.status(404).json({
            mensaje: "Operativo no encontrado"
        });
    }

    fs.unlinkSync(archivo);

    res.json({ mensaje: "Operativo eliminado correctamente" });
});

// Página principal
app.get("/", (req, res) => {
    res.send("Servidor SIGO-GN funcionando");
});

// Iniciar servidor
app.listen(4000, () => {
    console.log("Servidor funcionando en http://localhost:4000");
});
