/**
 * Titanium — Navigation type definitions
 */

export type JobsStackParamList = {
  Home: undefined;
  JobDetail: { jobId: string };
  WorkOrder: { workOrderId?: string; jobId: string };
  JobComplete: { jobId: string };
  JobPayment: { jobId: string; amount?: number };
};

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
  EquipmentDetail: { equipmentId: string; customerId: string };
};

export type EquipmentStackParamList = {
  EquipmentList: undefined;
  EquipmentDetail: { equipmentId: string; customerId?: string };
};

export type DispatchStackParamList = {
  DispatchList: undefined;
  JobDetail: { jobId: string };
};

export type RootTabParamList = {
  Jobs: undefined;
  Dispatch: undefined;
  Customers: undefined;
  Equipment: undefined;
  HowTo: undefined;
  Upsell: undefined;
};
