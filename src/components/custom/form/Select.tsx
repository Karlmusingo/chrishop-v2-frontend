import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  Select as SelectUI,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import { FC } from "react";

interface SelectProps extends SelectPrimitive.SelectProps {
  className?: string;
  onValueChange?: (value: string) => void;
  options?: { value: string; label: string }[];
}

const Select: FC<SelectProps> = ({
  onValueChange,
  className,
  options,
  ...props
}) => {
  return (
    <SelectUI
      onValueChange={onValueChange}
      {...props}
    >
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectUI>
  );
};

export default Select;
