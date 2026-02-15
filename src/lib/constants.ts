export const APP_MODULES = [
  { code: 'dashboard', name: 'Command Center', description: 'Access to the main dashboard map and trip summary' },
  { code: 'trips', name: 'Trips Management', description: 'Create, edit, and delete trip schedules' },
  { code: 'trip_tracking', name: 'Trip Tracking', description: 'Real-time tracking of active trips' },
  { code: 'vehicles', name: 'Vehicles', description: 'Manage fleet inventory and vehicle status' },
  { code: 'users', name: 'User Management', description: 'Manage system users and drivers' },
  { code: 'roles', name: 'Roles & Permissions', description: 'Manage RBAC settings' },
  { code: 'settings', name: 'System Settings', description: 'Global app configurations' },
] as const;

export type ModuleCode = typeof APP_MODULES[number]['code'];
