/**
 * Titanium — Core domain model types
 * Mirrors the Carbon ERP data model for field-side consumption.
 */

export type JobStatus =
  | 'scheduled'
  | 'en_route'
  | 'on_site'
  | 'completed'
  | 'cancelled';

export type WorkOrderStatus = 'draft' | 'open' | 'in_progress' | 'complete';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: Address;
  notes?: string;
}

export interface Equipment {
  id: string;
  customerId: string;
  make: string;
  model: string;
  serialNumber?: string;
  installedAt?: string; // ISO date
  lastServicedAt?: string; // ISO date
  notes?: string;
}

export interface ServiceHistoryEntry {
  id: string;
  equipmentId: string;
  workOrderId: string;
  date: string; // ISO date
  technicianName: string;
  summary: string;
}

export interface Job {
  id: string;
  customerId: string;
  customer: Customer;
  address: Address;
  scheduledAt: string; // ISO datetime
  status: JobStatus;
  description: string;
  notes?: string;
  workOrderIds: string[];
}

export interface WorkOrder {
  id: string;
  jobId: string;
  status: WorkOrderStatus;
  description: string;
  techNotes?: string;
  parts?: string[];
  createdAt: string; // ISO datetime
  completedAt?: string; // ISO datetime
}
