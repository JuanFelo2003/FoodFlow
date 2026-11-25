export type EmployeeRole = "admin" | "waiter" | "cashier" | "kitchen";

export interface Employee {
  id: number | string;
  name: string;
  email: string;
  role: EmployeeRole;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginResponse extends AuthTokens {
  employee: Employee;
}
