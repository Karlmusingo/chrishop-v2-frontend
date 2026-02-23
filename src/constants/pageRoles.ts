import { ROLES, RolesType } from "@/interface/roles";

export interface PageRoleValueType {
  roles: RolesType[];
  internalPublic: boolean; // public for logged in user regardless of your status
}

export interface PageRoleType {
  [key: string]: PageRoleValueType;
}

export default {
  "/": { roles: [], internalPublic: true },
  "/users": { roles: [ROLES.ADMIN], internalPublic: false },
  "/locations": { roles: [ROLES.ADMIN], internalPublic: false },
  "/configuration": { roles: [ROLES.ADMIN], internalPublic: false },
} as PageRoleType;
