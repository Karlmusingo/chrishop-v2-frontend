"use client";

import { FC, useEffect, useState } from "react";
import { lowerCase } from "lodash";

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
};

interface SearchableSelectProps {
  options: optionType[];
  onChange?: (value: string) => void;
  defaultValue?: string;
  extraState: { isLoading: boolean; data: optionType[] };
  placeholder?: string;
  value?: string;
}

const SearchableSelect: FC<SearchableSelectProps> = ({
  // options,
  onChange,
  defaultValue,
  extraState,
  placeholder,
  ...value
}) => {
  const [open, setOpen] = useState(false);
  const [internalValue, setValue] = useState(defaultValue);

  useEffect(() => {
    if (internalValue) onChange?.(internalValue);
  }, [internalValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ButtonUI
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {internalValue
            ? extraState?.data?.find(
                (item) => lowerCase(item.value) === lowerCase(internalValue)
              )?.label
            : placeholder || "Select..."}
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
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search options..." className="h-9" />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {!extraState?.isLoading &&
              extraState?.data?.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue: string) => {
                    setValue(currentValue);
                    setOpen(false);
                  }}
                >
                  {option.label}
                  {internalValue === option.value && (
                    <Icon className="ml-auto" name="Check" />
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
