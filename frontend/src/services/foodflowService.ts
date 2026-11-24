import type { EmployeeRole } from "../types/auth";
import type {
  Account,
  EmployeeRecord,
  MenuItem,
  Order,
  OrderItem,
  Payment,
  PaymentMethod,
  RestaurantTable,
  TableStatus,
  OrderStatus,
} from "../types/foodflow";
import { query, request } from "./api";

const get = <T,>(path: string) => request<T>(path);
const post = <T,>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });
const put = <T,>(path: string, body?: unknown) =>
  request<T>(path, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) });
const del = <T,>(path: string) => request<T>(path, { method: "DELETE" });

export const employeesApi = {
  list: () => get<EmployeeRecord[]>("/employees/"),
  get: (id: number) => get<EmployeeRecord>(`/employees/${id}`),
  create: (data: { name: string; email: string; password: string; role: EmployeeRole }) =>
    post<EmployeeRecord>("/employees/", data),
  update: (id: number, data: { name: string; email: string; password?: string; role: EmployeeRole }) =>
    put<EmployeeRecord>(`/employees/${id}`, data),
  setActive: (id: number, active: boolean) =>
    put<EmployeeRecord>(`/employees/${id}/active?${query({ active })}`),
};

export const menuApi = {
  list: () => get<MenuItem[]>("/menu-items/"),
  available: () => get<MenuItem[]>("/menu-items/available"),
  create: (data: { name: string; description: string; price: number; available: boolean }) =>
    request<MenuItem>(`/menu-items/?${query(data)}`, { method: "POST" }),
  update: (id: number, data: { name: string; description: string; price: number; available: boolean }) =>
    request<MenuItem>(`/menu-items/${id}?${query(data)}`, { method: "PUT" }),
  remove: (id: number) => del<void>(`/menu-items/${id}`),
  uploadImage: (id: number, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<MenuItem>(`/menu-items/${id}/image`, { method: "POST", body });
  },
};

export const tablesApi = {
  list: () => get<RestaurantTable[]>("/tables/"),
  byStatus: (status: TableStatus) =>
    get<RestaurantTable[]>(`/tables/status/${status}`),
  create: (number: number) =>
    request<RestaurantTable>(`/tables/?${query({ number })}`, { method: "POST" }),
  setStatus: (id: number, table_status: TableStatus) =>
    request<RestaurantTable>(`/tables/${id}/status?${query({ table_status })}`, { method: "PUT" }),
  remove: (id: number) => del<void>(`/tables/${id}`),
};

export const ordersApi = {
  list: () => get<Order[]>("/orders/"),
  byTable: (tableId: number) => get<Order[]>(`/orders/table/${tableId}`),
  byStatus: (status: OrderStatus) => get<Order[]>(`/orders/status/${status}`),
  get: (id: number) => get<Order>(`/orders/${id}`),
  create: (tableId: number) =>
    request<Order>(`/orders/?${query({ table_id: tableId })}`, { method: "POST" }),
  setStatus: (id: number, order_status: OrderStatus) =>
    request<Order>(`/orders/${id}/status?${query({ order_status })}`, { method: "PUT" }),
  remove: (id: number) => del<void>(`/orders/${id}`),
};

export const orderItemsApi = {
  list: (orderId: number) => get<OrderItem[]>(`/order-items/order/${orderId}`),
  get: (id: number) => get<OrderItem>(`/order-items/${id}`),
  create: (data: { order_id: number; menu_item_id: number; quantity: number }) =>
    request<OrderItem>(`/order-items/?${query(data)}`, { method: "POST" }),
  update: (id: number, quantity: number) =>
    request<OrderItem>(`/order-items/${id}?${query({ quantity })}`, { method: "PUT" }),
  remove: (id: number) => del<void>(`/order-items/${id}`),
};

export const accountsApi = {
  get: (id: number) => get<Account>(`/accounts/${id}`),
  byOrder: (orderId: number) => get<Account>(`/accounts/order/${orderId}`),
  create: (data: {
    order_id: number;
    discount_percentage: number;
    tax_name: string | null;
    tax_percentage: number;
    tip_percentage: number;
  }) => request<Account>(`/accounts/?${query(data)}`, { method: "POST" }),
  update: (id: number, data: {
    discount_percentage: number;
    tax_name: string | null;
    tax_percentage: number;
    tip_percentage: number;
  }) => request<Account>(`/accounts/${id}?${query(data)}`, { method: "PUT" }),
};

export const paymentsApi = {
  get: (id: number) => get<Payment>(`/payments/${id}`),
  byAccount: (accountId: number) => get<Payment>(`/payments/account/${accountId}`),
  create: (data: { account_id: number; payment_method: PaymentMethod; cash_received: number }) =>
    request<Payment>(`/payments/?${query(data)}`, { method: "POST" }),
  void: (id: number) => post<Payment>(`/payments/${id}/void`),
};
