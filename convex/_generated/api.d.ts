/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as functions_auth from "../functions/auth.js";
import type * as functions_authActions from "../functions/authActions.js";
import type * as functions_dashboard from "../functions/dashboard.js";
import type * as functions_email from "../functions/email.js";
import type * as functions_inventories from "../functions/inventories.js";
import type * as functions_locations from "../functions/locations.js";
import type * as functions_orders from "../functions/orders.js";
import type * as functions_packagingTemplates from "../functions/packagingTemplates.js";
import type * as functions_productBrands from "../functions/productBrands.js";
import type * as functions_productColors from "../functions/productColors.js";
import type * as functions_productSizes from "../functions/productSizes.js";
import type * as functions_productTypes from "../functions/productTypes.js";
import type * as functions_products from "../functions/products.js";
import type * as functions_seed from "../functions/seed.js";
import type * as functions_seedAttributes from "../functions/seedAttributes.js";
import type * as functions_users from "../functions/users.js";
import type * as functions_usersActions from "../functions/usersActions.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_password from "../lib/password.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "functions/auth": typeof functions_auth;
  "functions/authActions": typeof functions_authActions;
  "functions/dashboard": typeof functions_dashboard;
  "functions/email": typeof functions_email;
  "functions/inventories": typeof functions_inventories;
  "functions/locations": typeof functions_locations;
  "functions/orders": typeof functions_orders;
  "functions/packagingTemplates": typeof functions_packagingTemplates;
  "functions/productBrands": typeof functions_productBrands;
  "functions/productColors": typeof functions_productColors;
  "functions/productSizes": typeof functions_productSizes;
  "functions/productTypes": typeof functions_productTypes;
  "functions/products": typeof functions_products;
  "functions/seed": typeof functions_seed;
  "functions/seedAttributes": typeof functions_seedAttributes;
  "functions/users": typeof functions_users;
  "functions/usersActions": typeof functions_usersActions;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/password": typeof lib_password;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
