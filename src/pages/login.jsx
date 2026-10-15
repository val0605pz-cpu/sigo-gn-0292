
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usuarios } from "../Data/usuarios";

function Login() {

  // Variables para guardar los datos del formulario
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");

  // Permite cambiar de página
  const navigate = useNavigate();

  // Función para iniciar sesión
  const iniciarSesion = (e) => {
    e.preventDefault();

    // Buscar al usuario en el arreglo
    const encontrado = usuarios.find(
      (u) =>
        u.usuario === usuario &&
        u.contraseña === contraseña
    );

    if (encontrado) {

      // Guardar los datos sin la contraseña
      const { contraseña: clave, ...datos } = encontrado;

      localStorage.setItem(
        "sigoUsuario",
        JSON.stringify(datos)
      );

      // Enviar al Dashboard
      navigate("/dashboard");

    } else {

      // Mostrar error si los datos son incorrectos
      setError("Usuario o contraseña incorrectos");

    }
  };

  return (
    <div className="tarjeta">

      <h2>Iniciar sesión</h2>

      <form onSubmit={iniciarSesion}>

        <label>Usuario:</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Ingresa tu usuario"
          required
        />

        <label>Contraseña:</label>
        <input
          type="password"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          placeholder="Ingresa tu contraseña"
          required
        />

        <button type="submit">
          Ingresar
        </button>

        {error && <p className="error">{error}</p>}

      </form>

    </div>
  );
}

export default Login;
