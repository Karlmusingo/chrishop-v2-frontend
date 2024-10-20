export enum ROLES {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  SELLER = "SELLER",
  CASHIER = "CASHIER",
}

export const UserRoles = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SELLER: "SELLER",
  CASHIER: "CASHIER",
};

export type RolesType = ROLES;

export const RolesList = Object.values(ROLES).filter((key) =>
  isNaN(Number(key))
);
