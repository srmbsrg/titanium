/**
 * Titanium — Navigation type definitions
 * Root param lists for all navigators in the app.
 */

export type JobsStackParamList = {
  Home: undefined;
  JobDetail: { jobId: string };
  WorkOrder: { workOrderId?: string; jobId: string };
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

export type RootTabParamList = {
  Jobs: undefined;
  Customers: undefined;
  Equipment: undefined;
};
