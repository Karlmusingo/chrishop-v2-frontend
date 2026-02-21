import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  Select as SelectUI,
  SelectValue,
} from "@/components/ui/select";
import type * as SelectPrimitive from "@radix-ui/react-select";
import { type FC } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { type Control } from "react-hook-form";
import { capitalizeFirstLetter } from "@/lib/capitalize";

type OptionType = {
  label: string;
  value: string;
};

interface SelectProps extends SelectPrimitive.SelectProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  options: OptionType[];
}

const Select: FC<SelectProps> = ({
  control,
  name,
  label,
  placeholder = "Sélectionnez une option",
  description,
  options = [],
  ...extra
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <FormControl>
            <SelectUI
              onValueChange={field.onChange}
              {...field}
              {...extra}
              value={field.value ?? ""}
            >
              <SelectTrigger id={name}>
                <SelectValue
                  placeholder={placeholder}
                />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {capitalizeFirstLetter(option.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectUI>
          </FormControl>
          {!!description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default Select;
