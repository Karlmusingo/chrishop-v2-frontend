import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
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
import { capitalizeFirstLetter } from "@/lib/capitalize";
import { type Control } from "react-hook-form";

type OptionType = {
  label: string;
  value: string;
};

interface MultiSelectProps extends SelectPrimitive.SelectProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  options: OptionType[];
}

const MultiSelect: FC<MultiSelectProps> = ({
  control,
  name,
  label,
  placeholder = "Sélectionnez plusieurs options",
  description,
  options = [],
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <>
          <FormItem className="w-full">
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <FormControl>
              <MultiSelector
                className="w-full"
                onValuesChange={field.onChange}
                values={field.value || []}
              >
                <MultiSelectorTrigger className="">
                  <MultiSelectorInput className="" placeholder={placeholder} />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                  <MultiSelectorList>
                    {options.map(({ value, label }) => (
                      <MultiSelectorItem key={value} value={value}>
                        <div className="flex items-center space-x-2">
                          <span>{capitalizeFirstLetter(label)}</span>
                        </div>
                      </MultiSelectorItem>
                    ))}
                  </MultiSelectorList>
                </MultiSelectorContent>
              </MultiSelector>
            </FormControl>
            {!!description && <FormDescription>{description}</FormDescription>}
          </FormItem>
          <FormMessage />
        </>
      )}
    />
  );
};

export default MultiSelect;
