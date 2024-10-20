"use client";

import { FC, InputHTMLAttributes, useEffect, useState } from "react";
import { isEmpty, last, lowerCase, without } from "lodash";

import isUrl from "@/lib/isUrl";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ButtonUI } from "../ui/button";
import Icon from "./Icon";

type optionType = {
  value: string;
  label: string;
  icon?: string;
};

interface MultipleSelectProps extends InputHTMLAttributes<HTMLInputElement> {
  options: optionType[];
  onChange?: any; // should be (value: string[]) => void;
  defaultValue?: string[];
  extraState: { isLoading: boolean; data: optionType[] };
  placeholder?: string;
}

// todo: touched is not being updated because it is not wrapped in a field component
const MultipleSelect: FC<MultipleSelectProps> = ({
  options,
  onChange,
  defaultValue,
  extraState,
  placeholder,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [internalValues, setValues] = useState(
    (defaultValue as string[]) || []
  );
  const [touched, setTouched] = useState(false);

  const getLabel = (value?: string) =>
    options?.find((item) => item.value === (value || last(internalValues)))
      ?.label;

  const isSelected = (value: string) => internalValues.includes(value);

  useEffect(() => {
    if (internalValues) {
      onChange?.(internalValues);
    }
  }, [internalValues]);

  useEffect(() => {
    if (!touched && !isEmpty(defaultValue) && isEmpty(internalValues))
      setValues(defaultValue as string[]);
  }, [defaultValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ButtonUI
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {!isEmpty(internalValues) ? getLabel() : placeholder || "Select..."}
          {extraState?.isLoading ? (
            <Icon name="Loader" className=" h-4 w-4 animate-spin opacity-50" />
          ) : (
            <Icon
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              name="ChevronsUpDown"
            />
          )}
        </ButtonUI>
      </PopoverTrigger>
      <div className="selected | mt-2 flex  gap-2 px-2">
        {internalValues?.map((value) => (
          <div
            key={value}
            className="flex w-fit items-center gap-1 border border-dashed border-slate-300 bg-slate-200 px-2 py-0.5 text-xs font-semibold "
          >
            <span>{getLabel(value)}</span>
            <Icon
              name="X"
              className="h-3 w-3 cursor-pointer text-neutral-500"
              onClick={() => {
                setTouched(true);
                setValues(without(internalValues, value));
              }}
            />
          </div>
        ))}
      </div>
      <PopoverContent className="p-0">
        <Command
          className="w-full"
          filter={(value: string, search: string) => {
            const elementLabel = options?.find(
              (item) => item.value === value
            )?.label;

            if (elementLabel?.toLowerCase()?.includes(lowerCase(search)))
              return 1;
            return 0;
          }}
        >
          <CommandInput placeholder="Search options..." className="h-9" />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {!extraState?.isLoading &&
              options?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue: any) => {
                    setTouched(true);
                    if (internalValues.includes(currentValue)) {
                      setValues(without(internalValues, currentValue));
                      return;
                    }
                    setValues([...internalValues, currentValue]);
                  }}
                >
                  {!!option.icon && (
                    <Icon
                      {...{
                        [isUrl(option.icon) ? "url" : "name"]: option.icon,
                      }}
                      className="mr-1"
                    />
                  )}
                  {option.label}
                  {isSelected(option.value) && (
                    <Icon className="ml-auto" name="CircleCheck" />
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultipleSelect;
