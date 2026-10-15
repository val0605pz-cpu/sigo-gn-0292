
function Layout({ children }) {
  return (
    <div className="layout">

      <header className="header">
        <h1>SIGO-GN · Unidad 92</h1>
        <p>Sistema de Gestión Operativa</p>
      </header>

      <main className="contenido">
        {children}
      </main>

      <footer className="footer">
        <p>SIGO-GN | Sistemas Operativos</p>
      </footer>

    </div>
  );
}

export default Layout;
