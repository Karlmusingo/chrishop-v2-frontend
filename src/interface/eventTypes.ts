export enum EventTypes {
  LOCATION_UPDATE = "LOCATION_UPDATE",
  STEP_UPDATE = "STEP_UPDATE",
  SOS = "SOS",
  STEP_REMINDER = "STEP_REMINDER",
}

export type EventsType = EventTypes;

export const eventTypeList = Object.values(EventTypes).filter((key) =>
  isNaN(Number(key))
);
