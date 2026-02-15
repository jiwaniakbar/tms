import { getRoles } from '@/app/actions';
import { getRolePermissions } from '@/lib/rbac-server';
import RolesClient from './RolesClient';

export default async function RolesPage() {
  const roles = await getRoles();
  
  const permissionsMap: Record<number, any> = {};
  for (const r of roles) {
    permissionsMap[r.id] = await getRolePermissions(r.id);
  }

  return (
    <div className="container">
      <h1 className="page-title">Role Management</h1>
      <RolesClient initialRoles={roles} initialPermissions={permissionsMap} />
    </div>
  );
}
