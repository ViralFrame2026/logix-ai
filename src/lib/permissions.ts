export const roles = ["owner", "admin", "manager", "operator", "viewer"] as const;
export type Role = (typeof roles)[number];

export type Permission =
  | "organization.manage"
  | "members.manage"
  | "warehouse.manage"
  | "operations.write"
  | "operations.read"
  | "reports.read";

const permissions: Record<Role, ReadonlySet<Permission>> = {
  owner: new Set([
    "organization.manage",
    "members.manage",
    "warehouse.manage",
    "operations.write",
    "operations.read",
    "reports.read",
  ]),
  admin: new Set([
    "members.manage",
    "warehouse.manage",
    "operations.write",
    "operations.read",
    "reports.read",
  ]),
  manager: new Set(["warehouse.manage", "operations.write", "operations.read", "reports.read"]),
  operator: new Set(["operations.write", "operations.read"]),
  viewer: new Set(["operations.read", "reports.read"]),
};

export function can(role: Role, permission: Permission) {
  return permissions[role].has(permission);
}

export const roleLabels: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  operator: "Operator",
  viewer: "Viewer",
};
