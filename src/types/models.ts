/**
 * Titanium — Core domain model types
 */

export type JobStatus =
  | 'scheduled'
  | 'en_route'
  | 'on_site'
  | 'completed'
  | 'cancelled';

export type WorkOrderStatus = 'draft' | 'open' | 'in_progress' | 'complete';

export type PaymentMethod = 'card' | 'cash' | 'check' | 'invoice';

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
  installedAt?: string;
  lastServicedAt?: string;
  notes?: string;
}

export interface ServiceHistoryEntry {
  id: string;
  equipmentId: string;
  workOrderId: string;
  date: string;
  technicianName: string;
  summary: string;
}

export interface Job {
  id: string;
  customerId: string;
  customer: Customer;
  address: Address;
  scheduledAt: string;
  status: JobStatus;
  description: string;
  notes?: string;
  workOrderIds: string[];
  estimatedDuration?: number; // minutes
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface WorkOrder {
  id: string;
  jobId: string;
  status: WorkOrderStatus;
  description: string;
  techNotes?: string;
  parts?: PartUsed[];
  laborHours?: number;
  createdAt: string;
  completedAt?: string;
}

export interface PartUsed {
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface CompletionReport {
  jobId: string;
  workSummary: string;
  partsUsed: PartUsed[];
  laborHours: number;
  techSignature?: string;
  customerSignature?: string;
  photoUris?: string[];
  completedAt: string;
}

export interface PaymentRecord {
  jobId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  collectedAt: string;
}
