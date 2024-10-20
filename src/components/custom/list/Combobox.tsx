"use client";

import { FC, useState } from "react";
import { useSearchParams } from "next/navigation";
import { capitalize, isEmpty, last, size, without } from "lodash";
import { CldImage } from "next-cloudinary";

import { cn } from "@/lib/utils";
import { useQueryString } from "@/hooks/useQueryString";

import { ButtonUI } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import Button from "../Button";
import Icon, { iconType } from "../Icon";

export type comboboxOptionsType = {
  value: string;
  label: string;
  icon?: iconType;
  image?: string;
};

interface ComboBoxFilterProps {
  options: comboboxOptionsType[];
  filterKey?: string;
  // onChange?: (value: string) => void;
  // defaultValue?: string;
  // extraState: { isLoading: boolean; data: comboboxOptionsType[] };
  // placeholder?: string;
  // value?: string
}

const ComboBoxFilter: FC<ComboBoxFilterProps> = ({
  options,
  filterKey = "filter",
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const filter = searchParams.get(filterKey);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filter?.split(",") || []
  );
  const { pushQuery, removeQuery } = useQueryString();

  const getTriggerLabel = () => capitalize(last(filterKey?.split("_")));

  const isSelected = (value: string) => selectedStatuses.includes(value);
  const getLabel = (value: string) =>
    options.find((item) => item.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ButtonUI
          variant="outline"
          size="xs"
          className=" relative h-8 w-auto space-x-2 border-dashed px-3 py-2 text-xs shadow-sm"
        >
          <div className="flex gap-1">
            <Icon name="Filter" className="h-4 w-4 text-neutral-500" />{" "}
            {getTriggerLabel()}
          </div>
          {!isEmpty(selectedStatuses) && (
            <>
              <Separator orientation="vertical" />
              <div className="flex gap-1">
                {size(selectedStatuses) < 3 ? (
                  selectedStatuses.map((status) => (
                    <Badge
                      key={status}
                      variant="secondary"
                      className=" font-normal"
                    >
                      {getLabel(status)}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className=" font-normal">
                    {size(selectedStatuses)} selected
                  </Badge>
                )}
              </div>
            </>
          )}
        </ButtonUI>
      </PopoverTrigger>

      {!isEmpty(selectedStatuses) && (
        <Button
          icon="X"
          className="ml-2 h-8 p-1"
          variant="ghost"
          onClick={() => {
            removeQuery(filterKey);
            setSelectedStatuses([]);
          }}
        />
      )}

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Filter status..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((status) => (
                <CommandItem
                  key={status.value}
                  value={status.value}
                  onSelect={(value: string) => {
                    if (selectedStatuses.includes(value)) {
                      setSelectedStatuses(without(selectedStatuses, value));
                      pushQuery(
                        filterKey,
                        without(selectedStatuses, value).join(",")
                      );
                    } else {
                      setSelectedStatuses([...selectedStatuses, value]);
                      pushQuery(
                        filterKey,
                        [...selectedStatuses, value].join(",")
                      );
                    }
                    setOpen(false);
                  }}
                  className={cn({
                    "bg-accent text-accent-foreground": isSelected(
                      status.value
                    ),
                  })}
                >
                  <>
                    {status.icon && (
                      <Icon name={status.icon} className="mr-1" />
                    )}
                    {status.image && (
                      <CldImage
                        width={16}
                        height={16}
                        crop="fill"
                        src={status?.image}
                        alt={status?.label}
                        className="mr-1"
                      />
                    )}
                    {status.label}
                  </>
                  {isSelected(status.value) && (
                    <Icon className="ml-auto" name="CircleCheck" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBoxFilter;
