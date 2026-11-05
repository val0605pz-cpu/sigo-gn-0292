
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

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
app.post("/expedientes", (req, res) => {
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
app.put("/expedientes/:folio", (req, res) => {
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
app.delete("/expedientes/:folio", (req, res) => {
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

// Página principal
app.get("/", (req, res) => {
    res.send("Servidor SIGO-GN funcionando");
});

// Iniciar servidor
app.listen(4000, () => {
    console.log("Servidor funcionando en http://localhost:4000");
});
