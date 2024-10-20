"use client";
import { FC, ReactNode } from "react";
import { Mail } from "lucide-react";
import { Control } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input as InputComponent, InputUIProps } from "../../ui/input";
import Select from "./Select";
import MultiSelect from "./MultiSelectInput";

export interface InputProps extends InputUIProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  type?:
  | "text"
  | "password"
  | "email"
  | "number"
  | "select"
  | "multi-select"
  | "textArea"
  | "custom";
  CustomInput?: FC<any>;
  extraState?: any;
  options?: any;
}

const Input: FC<InputProps> = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  description,
  CustomInput,
  extraState,
  options,
  ...props
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {type === "text" ? (
              <InputComponent placeholder={placeholder} {...field} {...props} />
            ) : type === "password" ? (
              <InputComponent
                type="password"
                placeholder={placeholder}
                {...field}
                {...props}
              />
            ) : type === "number" ? (
              <InputComponent
                type="number"
                placeholder={placeholder}
                {...field}
                value={field.value?.toString?.()}
                {...props}
              />
            ) : type === "select" ? (
              <Select
                className="w-full"
                options={options || []}
                onValueChange={field.onChange}
                defaultValue={field.value || props.defaultValue}
                {...field}
              />
            ) : type === "multi-select" ? (
              <MultiSelect
                options={options || []}
                onValuesChange={field.onChange}
                defaultValue={field.value || props.defaultValue}
                values={field.value}
                {...field}
              />
            ) : type === "textArea" ? (
              <Textarea placeholder={placeholder} {...field} />
            ) : type === "email" ? (
              <div className="relative">
                <InputComponent
                  type="email"
                  placeholder="Email"
                  className="pl-10"
                  {...field}
                />
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              </div>
            ) : (
              type === "custom" &&
              CustomInput && (
                <CustomInput extraState={extraState} {...field} {...props} />
              )
            )}
          </FormControl>
          {!!description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default Input;
