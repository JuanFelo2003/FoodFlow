import { Link } from "react-router-dom";

function AccessDeniedPage() {
  return (
    <main>
      <h1>403</h1>
      <h2>Acceso denegado</h2>
      <p>No tienes permisos para acceder a esta sección.</p>
      <Link to="/dashboard">Volver al panel principal</Link>
    </main>
  );
}

export default AccessDeniedPage;
