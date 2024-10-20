import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  Select as SelectUI,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as SelectPrimitive from "@radix-ui/react-select";
import Image from "next/image";
import { FC } from "react";

interface SelectProps extends SelectPrimitive.SelectProps {
  className?: string;
  onValueChange?: (value: string) => void;
  options: { label: string; value: string }[];
}

const CountryDropdown: FC<SelectProps> = ({
  onValueChange,
  className,
  options = [],
  defaultValue,
  ...props
}) => {
  return (
    <SelectUI
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      {...props}
    >
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              {/* <Image
                src={`/assets/flags/${option.value}.svg`}
                alt={option.label}
                width={24}
                height={16}
              /> */}
              <span />
              {option.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </SelectUI>
  );
};

export default CountryDropdown;
