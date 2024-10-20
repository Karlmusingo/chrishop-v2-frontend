"use client"

import React from "react";
import { TimeValue, } from "react-aria";
import { TimeFieldStateOptions } from "react-stately";
import { TimeField } from "./time-field";

const TimePicker = React.forwardRef<
  HTMLDivElement,
  Omit<TimeFieldStateOptions<TimeValue>, "locale">
>((props, forwardedRef) => {
  return <TimeField {...props} shouldForceLeadingZeros hourCycle={24}  />;
});

TimePicker.displayName = "TimePicker";

export { TimePicker };