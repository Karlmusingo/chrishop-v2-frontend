"use client";

import React, { FC } from "react";
import { useRouter } from "next/navigation";
import { IUnknown } from "@/interface/Iunknown";
import { capitalize } from "lodash";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type dropdownMenuActionType = (
  id: string,
  hooks?: IUnknown,
  extraData?: IUnknown
) => void;

interface DropdownProps {
  trigger: React.ReactElement | string;
  title?: string;
  items: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
    hide?: (id: string, extraData?: IUnknown) => boolean;
  }[];
  id: string;
  extraHooks?: IUnknown;
  data?: IUnknown;
}

const Dropdown: FC<DropdownProps> = ({
  trigger,
  title,
  items,
  id,
  data,
  extraHooks = {},
}) => {
  const { push } = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {!!title && (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item) => {
          const disabled = item.disable?.(id, data) || false;
          const hidden = item.hide?.(id, data) || false;
          return (
            <DropdownMenuItem
              key={item.label}
              onClick={() => item?.action?.(id, { push, ...extraHooks }, data)}
              disabled={disabled}
              className={`${hidden ? "hidden" : ""}`}
            >
              {capitalize(item.label)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
