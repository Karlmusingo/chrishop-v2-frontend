import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const roleValidator = v.union(
  v.literal("ADMIN"),
  v.literal("MANAGER"),
  v.literal("SELLER"),
  v.literal("CASHIER"),
);

export const userStatusValidator = v.union(
  v.literal("PENDING"),
  v.literal("ACTIVE"),
  v.literal("INACTIVE"),
);

export const locationStatusValidator = v.union(
  v.literal("ACTIVE"),
  v.literal("INACTIVE"),
);

export const orderStatusValidator = v.union(
  v.literal("PENDING"),
  v.literal("PAID"),
  v.literal("CANCEL"),
);

export default defineSchema({
  ...authTables,
  users: defineTable({
    // Convex Auth fields
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom fields
    firstName: v.optional(v.string()),
    middleName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    salt: v.optional(v.string()),
    role: v.optional(roleValidator),
    status: v.optional(userStatusValidator),
    isFirstLogin: v.optional(v.boolean()),
    locationId: v.optional(v.id("locations")),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_phoneNumber", ["phoneNumber"])
    .index("by_role", ["role"]),

  products: defineTable({
    name: v.string(),
    type: v.optional(v.string()), //
    brand: v.optional(v.string()),
    color: v.optional(v.string()),
    size: v.optional(v.string()),
    collarColor: v.optional(v.string()),
    sleeves: v.optional(v.string()), // short, long
    number: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .index("by_brand", ["brand"]),

  locations: defineTable({
    name: v.string(),
    province: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhoneNumber: v.optional(v.string()),
    status: locationStatusValidator,
  }).index("by_name", ["name"]),

  inventories: defineTable({
    price: v.number(),
    quantity: v.number(),
    expectedRevenue: v.optional(v.number()),
    productName: v.string(),
    productId: v.id("products"),
    locationId: v.optional(v.id("locations")),
  })
    .index("by_productId", ["productId"])
    .index("by_locationId", ["locationId"])
    .index("by_productId_locationId", ["productId", "locationId"]),

  orders: defineTable({
    totalAmount: v.number(),
    status: orderStatusValidator,
    locationId: v.id("locations"),
    userId: v.id("users"),
  })
    .index("by_locationId", ["locationId"])
    .index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  orderItems: defineTable({
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    orderId: v.id("orders"),
    productId: v.id("products"),
    locationId: v.id("locations"),
    userId: v.id("users"),
  })
    .index("by_orderId", ["orderId"])
    .index("by_productId", ["productId"]),
});
