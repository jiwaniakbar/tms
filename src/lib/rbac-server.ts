import { getDb } from './db';

// Use Lazy Singleton to avoid initialization during module evaluation
const db = getDb();
// import { APP_MODULES } from './constants'; // Avoiding compile issues during initial seed

const APP_MODULES_CODES = ['dashboard', 'trips', 'trip_tracking', 'vehicles', 'users', 'roles', 'settings'];

export type PermissionSet = {
  [key: string]: {
    view: boolean;
    edit: boolean;
  }
};

export async function getRolePermissions(roleId: number): Promise<PermissionSet> {
  const stmt = db.prepare('SELECT module_code, can_view, can_edit FROM role_permissions WHERE role_id = ?');
  const rows = stmt.all(roleId) as { module_code: string, can_view: number, can_edit: number }[];

  const permissions: PermissionSet = {};

  // Default all modules to false first
  APP_MODULES_CODES.forEach(code => {
    permissions[code] = { view: false, edit: false };
  });

  rows.forEach(r => {
    permissions[r.module_code] = {
      view: !!r.can_view,
      edit: !!r.can_edit
    };
  });

  return permissions;
}
