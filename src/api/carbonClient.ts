/**
 * carbonClient — Titanium's HTTP client for the Carbon ERP backend
 *
 * Carbon is the Carborundum AI ERP platform for trades businesses.
 * All field-side data access goes through this module.
 *
 * Status: stub — no real endpoints yet. Replace BASE_URL and implement
 * each method against the Carbon API once available.
 *
 * Auth: Bearer token injected via Axios interceptor (set token after login).
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Customer, Equipment, Job, ServiceHistoryEntry, WorkOrder } from '../types/models';

// ---------------------------------------------------------------------------
// Config — update BASE_URL when Carbon backend is reachable
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.CARBON_API_URL ?? 'https://api.carbonerp.internal/v1';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Inject auth token
http.interceptors.request.use((config) => {
  // Token is stored in Zustand store; import lazily to avoid circular deps
  // const { token } = useTitaniumStore.getState();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
http.interceptors.response.use(
  (res) => res,
  (err) => {
    // TODO: detect offline (network error) and push mutation to offline queue
    return Promise.reject(err);
  },
);

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export async function getJobs(): Promise<Job[]> {
  const { data } = await http.get<Job[]>('/jobs');
  return data;
}

export async function getJob(jobId: string): Promise<Job> {
  const { data } = await http.get<Job>(`/jobs/${jobId}`);
  return data;
}

export async function updateJobStatus(
  jobId: string,
  status: Job['status'],
): Promise<Job> {
  const { data } = await http.patch<Job>(`/jobs/${jobId}/status`, { status });
  return data;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function getCustomers(): Promise<Customer[]> {
  const { data } = await http.get<Customer[]>('/customers');
  return data;
}

export async function getCustomer(customerId: string): Promise<Customer> {
  const { data } = await http.get<Customer>(`/customers/${customerId}`);
  return data;
}

// ---------------------------------------------------------------------------
// Work Orders
// ---------------------------------------------------------------------------

export async function getWorkOrder(workOrderId: string): Promise<WorkOrder> {
  const { data } = await http.get<WorkOrder>(`/work-orders/${workOrderId}`);
  return data;
}

export async function saveWorkOrder(
  payload: Omit<WorkOrder, 'id' | 'createdAt'> & { id?: string },
): Promise<WorkOrder> {
  if (payload.id) {
    const { data } = await http.put<WorkOrder>(
      `/work-orders/${payload.id}`,
      payload,
    );
    return data;
  }
  const { data } = await http.post<WorkOrder>('/work-orders', payload);
  return data;
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export async function getEquipmentForCustomer(
  customerId: string,
): Promise<Equipment[]> {
  const { data } = await http.get<Equipment[]>(
    `/customers/${customerId}/equipment`,
  );
  return data;
}

export async function getEquipment(equipmentId: string): Promise<Equipment> {
  const { data } = await http.get<Equipment>(`/equipment/${equipmentId}`);
  return data;
}

export async function getAllEquipment(): Promise<Equipment[]> {
  const { data } = await http.get<Equipment[]>('/equipment');
  return data;
}

export async function getServiceHistory(
  equipmentId: string,
): Promise<ServiceHistoryEntry[]> {
  const { data } = await http.get<ServiceHistoryEntry[]>(
    `/equipment/${equipmentId}/service-history`,
  );
  return data;
}

// ---------------------------------------------------------------------------
// Convenience re-export
// ---------------------------------------------------------------------------

export const carbonClient = {
  getJobs,
  getJob,
  updateJobStatus,
  getCustomers,
  getCustomer,
  getWorkOrder,
  saveWorkOrder,
  getEquipmentForCustomer,
  getEquipment,
  getAllEquipment,
  getServiceHistory,
};
