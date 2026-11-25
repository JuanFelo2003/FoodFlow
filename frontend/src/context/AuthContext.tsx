import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Employee } from "../types/auth";
import {
  login as loginRequest,
  refreshAccessToken,
} from "../services/authService";

interface AuthContextType {
  employee: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function clearSession(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("employee");
}

function getStoredEmployee(): Employee | null {
  const storedEmployee = sessionStorage.getItem("employee");
  const refreshToken = sessionStorage.getItem("refresh_token");
  if (!storedEmployee || !refreshToken) {
    clearSession();
    return null;
  }
  try {
    const employee = JSON.parse(storedEmployee) as Employee;
    if (!employee.id || !employee.email || !employee.role)
      throw new Error("Sesión inválida");
    return employee;
  } catch {
    clearSession();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(getStoredEmployee);
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(
      sessionStorage.getItem("employee") &&
      sessionStorage.getItem("refresh_token"),
    ),
  );

  const logout = useCallback(() => {
    clearSession();
    setEmployee(null);
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const response = await loginRequest(email, password);
    sessionStorage.setItem("access_token", response.access_token);
    sessionStorage.setItem("refresh_token", response.refresh_token);
    sessionStorage.setItem("employee", JSON.stringify(response.employee));
    setEmployee(response.employee);
  }

  useEffect(() => {
    const handleSessionExpired = () => logout();
    window.addEventListener("foodflow:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener(
        "foodflow:session-expired",
        handleSessionExpired,
      );
  }, [logout]);

  useEffect(() => {
    if (employee) {
      void refreshAccessToken().finally(() => setIsLoading(false));
    }
  }, [employee]);

  return (
    <AuthContext.Provider
      value={{
        employee,
        isAuthenticated: employee !== null,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  return context;
}
