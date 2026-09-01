/**
 * carbonClient — Titanium's HTTP client for the Carborundum AI / Manifold ERP backend
 *
 * Base URL: https://app.carborundum.ai/api/erp
 * Auth: Bearer JWT (set after login via useTitaniumStore)
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Customer, Equipment, Job, ServiceHistoryEntry, WorkOrder, CompletionReport, PaymentRecord } from '../types/models';
import { Config } from '../config';

const BASE_URL = Config.MANIFOLD_API_URL;

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Inject auth token from Zustand store
http.interceptors.request.use((config) => {
  try {
    // Dynamic import avoids circular dependency
    const { useTitaniumStore } = require('../store');
    const { token } = useTitaniumStore.getState();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      console.warn('[Titanium] Network error — check connectivity');
    }
    return Promise.reject(err);
  },
);

// ---------------------------------------------------------------------------
// Jobs — maps to Manifold CRM / service-orders
// ---------------------------------------------------------------------------

export async function getJobs(techId?: string): Promise<Job[]> {
  const { data } = await http.get('/crm/sales-orders', {
    params: { assignedTo: techId, type: 'service' },
  });
  return (data.salesOrders || data.orders || []).map(mapToJob);
}

export async function getJob(jobId: string): Promise<Job> {
  const { data } = await http.get(`/crm/sales-orders/${jobId}`);
  return mapToJob(data.salesOrder || data);
}

export async function updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
  const { data } = await http.patch(`/crm/sales-orders/${jobId}`, { status });
  return mapToJob(data.salesOrder || data);
}

export async function completeJob(report: CompletionReport): Promise<void> {
  await http.post(`/crm/sales-orders/${report.jobId}/complete`, report);
}

// ---------------------------------------------------------------------------
// Customers — maps to Manifold CRM customers
// ---------------------------------------------------------------------------

export async function getCustomers(): Promise<Customer[]> {
  const { data } = await http.get('/crm/customers');
  return data.customers || [];
}

export async function getCustomer(customerId: string): Promise<Customer> {
  const { data } = await http.get(`/crm/customers/${customerId}`);
  return data.customer || data;
}

// ---------------------------------------------------------------------------
// Work Orders
// ---------------------------------------------------------------------------

export async function getWorkOrder(workOrderId: string): Promise<WorkOrder> {
  const { data } = await http.get(`/crm/sales-orders/${workOrderId}`);
  return data.salesOrder || data;
}

export async function saveWorkOrder(
  payload: Omit<WorkOrder, 'id' | 'createdAt'> & { id?: string },
): Promise<WorkOrder> {
  if (payload.id) {
    const { data } = await http.patch(`/crm/sales-orders/${payload.id}`, payload);
    return data.salesOrder || data;
  }
  const { data } = await http.post('/crm/sales-orders', payload);
  return data.salesOrder || data;
}

// ---------------------------------------------------------------------------
// Equipment
// ---------------------------------------------------------------------------

export async function getEquipmentForCustomer(customerId: string): Promise<Equipment[]> {
  const { data } = await http.get(`/crm/customers/${customerId}/equipment`);
  return data.equipment || [];
}

export async function getEquipment(equipmentId: string): Promise<Equipment> {
  const { data } = await http.get(`/inventory/equipment/${equipmentId}`);
  return data.item || data;
}

export async function getAllEquipment(): Promise<Equipment[]> {
  const { data } = await http.get('/inventory', { params: { type: 'stock' } });
  return data.inventory || [];
}

export async function getServiceHistory(equipmentId: string): Promise<ServiceHistoryEntry[]> {
  const { data } = await http.get(`/crm/customers/equipment/${equipmentId}/history`);
  return data.history || [];
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export async function recordPayment(payment: PaymentRecord): Promise<void> {
  await http.post('/finance', {
    entity: 'invoice_payment',
    data: {
      jobId: payment.jobId,
      amountPaid: payment.amount,
      method: payment.method,
      reference: payment.reference,
    },
  });
}

// ---------------------------------------------------------------------------
// Tes AI (Carb-O-Comm agent)
// ---------------------------------------------------------------------------

export async function queryTes(message: string, context: {
  jobId?: string;
  customerId?: string;
  techName?: string;
}): Promise<string> {
  const { data } = await http.post('/agents/tes/query', { message, context });
  return data.response || data.message || 'No response from Tes.';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapToJob(raw: any): Job {
  return {
    id: raw.id,
    customerId: raw.customerId || raw.customer?.id || '',
    customer: raw.customer || {
      id: raw.customerId || '',
      name: raw.customerName || 'Unknown',
      phone: '',
      address: { street: raw.address || '', city: '', state: '', zip: '' },
    },
    address: raw.address
      ? typeof raw.address === 'string'
        ? { street: raw.address, city: '', state: '', zip: '' }
        : raw.address
      : { street: '', city: '', state: '', zip: '' },
    scheduledAt: raw.scheduledAt || raw.orderDate || new Date().toISOString(),
    status: raw.status || 'scheduled',
    description: raw.description || raw.notes || '',
    notes: raw.notes,
    workOrderIds: raw.workOrderIds || [],
    estimatedDuration: raw.estimatedDuration,
    priority: raw.priority,
  };
}

export const carbonClient = {
  getJobs,
  getJob,
  updateJobStatus,
  completeJob,
  getCustomers,
  getCustomer,
  getWorkOrder,
  saveWorkOrder,
  getEquipmentForCustomer,
  getEquipment,
  getAllEquipment,
  getServiceHistory,
  recordPayment,
  queryTes,
};

// ===========================================================================
// Carbon dedicated jobs API — talks to /api/carbon/jobs (additive; separate
// from the ERP /crm/sales-orders path above). Backed by Silicon's Postgres
// Job / JobNote / JobPhoto models. Lights up once the carbon migration is
// applied to the Silicon DB. Response shape is { ok, ... }.
// ===========================================================================

const carbonHttp: AxiosInstance = axios.create({
  baseURL: Config.CARBON_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

carbonHttp.interceptors.request.use((config) => {
  try {
    const { useTitaniumStore } = require('../store');
    const { token } = useTitaniumStore.getState();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {}
  return config;
});

function mapCarbonJob(raw: any): Job {
  const street =
    typeof raw.address === 'string' ? raw.address : raw.address?.street ?? '';
  const addr = { street, city: '', state: '', zip: '' };
  return {
    id: raw.id,
    customerId: raw.customerId || '',
    customer: {
      id: raw.customerId || '',
      name: raw.customerName || 'Unknown',
      phone: '',
      address: addr,
    },
    address: addr,
    scheduledAt: raw.scheduledFor || raw.createdAt || new Date().toISOString(),
    status: raw.status || 'scheduled',
    description: raw.symptom || raw.diagnosis || '',
    notes: Array.isArray(raw.notes)
      ? raw.notes.map((n: any) => n.body).join('\n')
      : raw.notes,
    workOrderIds: [],
    priority: raw.priority,
  } as Job;
}

export async function getCarbonJobs(opts?: { status?: string; tech?: string }): Promise<Job[]> {
  const { data } = await carbonHttp.get('/jobs', { params: opts });
  return (data.jobs || []).map(mapCarbonJob);
}

export async function getCarbonJob(jobId: string): Promise<Job> {
  const { data } = await carbonHttp.get(`/jobs/${jobId}`);
  return mapCarbonJob(data.job);
}

export async function createCarbonJob(payload: {
  customerName: string;
  address: string;
  trade?: string;
  symptom?: string;
  scheduledFor?: string;
  assignedTech?: string;
  latitude?: number;
  longitude?: number;
}): Promise<Job> {
  const { data } = await carbonHttp.post('/jobs', payload);
  return mapCarbonJob(data.job);
}

export async function patchCarbonJob(
  jobId: string,
  patch: Record<string, unknown>,
): Promise<Job> {
  const { data } = await carbonHttp.patch(`/jobs/${jobId}`, patch);
  return mapCarbonJob(data.job);
}

export async function addCarbonJobNote(
  jobId: string,
  body: string,
  author = 'tech',
): Promise<void> {
  await carbonHttp.post(`/jobs/${jobId}/notes`, { body, author });
}

export async function addCarbonJobPhoto(
  jobId: string,
  url: string,
  caption?: string,
): Promise<void> {
  await carbonHttp.post(`/jobs/${jobId}/photos`, { url, caption });
}

export const carbonJobsApi = {
  getCarbonJobs,
  getCarbonJob,
  createCarbonJob,
  patchCarbonJob,
  addCarbonJobNote,
  addCarbonJobPhoto,
};
