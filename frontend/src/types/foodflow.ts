import type { EmployeeRole } from "./auth";

export type TableStatus = "disponible" | "ocupada" | "en_atencion";
export type OrderStatus = "en_proceso" | "servida" | "pagada";
export type PaymentMethod = "efectivo" | "tarjeta";
export type PaymentStatus = "registrado" | "anulado";

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  available: boolean;
  image_url: string | null;
}

export interface RestaurantTable {
  id: number;
  number: number;
  status: TableStatus;
}

export interface Order {
  id: number;
  table_id: number;
  status: OrderStatus;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  quantity: number;
  unit_price: number | string;
}

export interface Account {
  id: number;
  order_id: number;
  subtotal: number | string;
  discount_percentage: number | string;
  discount_amount: number | string;
  taxable_amount: number | string;
  tax_name: string | null;
  tax_percentage: number | string;
  tax_amount: number | string;
  tip_percentage: number | string;
  tip_amount: number | string;
  total: number | string;
  created_at: string;
}

export interface Payment {
  id: number;
  account_id: number;
  employee_id: number;
  amount: number | string;
  payment_method: PaymentMethod;
  cash_received: number | string;
  change_amount: number | string;
  status: PaymentStatus;
  paid_at: string;
}

export interface EmployeeRecord {
  id: number;
  name: string;
  email: string;
  role: EmployeeRole;
  active: boolean;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
