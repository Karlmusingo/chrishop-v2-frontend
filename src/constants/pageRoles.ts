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
  "/countries": { roles: [ROLES.SUPER_ADMIN], internalPublic: false },
  "/companies": {
    roles: [ROLES.SUPER_ADMIN, ROLES.COUNTRY_DIRECTOR],
    internalPublic: false,
  },
  "/users": { roles: [ROLES.SUPER_ADMIN], internalPublic: false },

  // '/drivers': { roles: ['OPERATOR'], internalPublic: false },
  // '/users': { roles: ['ADMIN', 'OPERATOR'], internalPublic: false },
  // '/operators': { roles: ['ADMIN'], internalPublic: false },
  // '/configurations/': { roles: ['OPERATOR'], internalPublic: false },
  // '/orders': { roles: ['BUSINESS'], internalPublic: false },
  // '/menus': { roles: ['BUSINESS'], internalPublic: false },
  // '/settings': { roles: ['USER'], internalPublic: true },
  // '/profile': { roles: ['USER'], internalPublic: true },
} as PageRoleType;
