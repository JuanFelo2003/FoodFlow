import { useAuth } from "../context/AuthContext";
import type { EmployeeRole } from "../types/auth";

const roleNames: Record<EmployeeRole, string> = {
  admin: "Administrador",
  waiter: "Mesero",
  cashier: "Cajero",
  kitchen: "Cocina",
};

function DashboardPage() {
  const { employee, logout } = useAuth();

  return (
    <main>
      <h1>FoodFlow</h1>
      <h2>Panel principal</h2>

      {employee && (
        <>
          <p>Bienvenido, {employee.name}</p>
          <p>Correo: {employee.email}</p>
          <p>Rol: {roleNames[employee.role]}</p>
        </>
      )}

      <button onClick={logout}>Cerrar sesión</button>
    </main>
  );
}

export default DashboardPage;
