
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Expedientes from "./pages/Expedientes";
import Permisos from "./pages/Permisos";
import Operativos from "./pages/Operativos";
import Layout from "./Components/Layout";
import RutaProtegida from "./Components/RutaProtegida";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Inicio de sesión */}
          <Route path="/" element={<Login />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />

          {/* Expedientes */}
          <Route
            path="/expedientes"
            element={
              <RutaProtegida>
                <Expedientes />
              </RutaProtegida>
            }
          />

          {/* Permisos */}
          <Route
            path="/permisos"
            element={
              <RutaProtegida>
                <Permisos />
              </RutaProtegida>
            }
          />

          {/* Práctica 06: Operativos */}
          <Route
            path="/operativos"
            element={
              <RutaProtegida>
                <Operativos />
              </RutaProtegida>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
