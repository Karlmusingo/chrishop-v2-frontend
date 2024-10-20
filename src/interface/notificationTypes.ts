export enum NotificationTypes {
  INACTIVE = "INACTIVE", // Inactive: falling asleep
  SOS = "SOS",
  GEO_FENCE = "GEO_FENCE",
}

export type NotificationType = NotificationTypes;

export const notificationTypeList = Object.values(NotificationTypes).filter(
  (key) => isNaN(Number(key))
);
