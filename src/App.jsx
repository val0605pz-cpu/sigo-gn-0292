
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Layout from "./Components/Layout";
import RutaProtegida from "./Components/RutaProtegida";

function App() {
  return (
    <BrowserRouter>

      <Layout>

        <Routes>

          {/* Ruta para iniciar sesión */}
          <Route
            path="/"
            element={<Login />}
          />

          {/* Ruta protegida del Dashboard */}
          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <Dashboard />
              </RutaProtegida>
            }
          />

        </Routes>

      </Layout>

    </BrowserRouter>
  );
}

export default App;
