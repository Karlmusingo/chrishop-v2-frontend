'use client';

import React, { FC } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { capitalize } from 'lodash';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IUnknown } from '@/interface/Iunknown';

interface ActionDropdownProps {
  trigger: React.ReactElement | string;
  title: string;
  items: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
  }[];
  id: string;
}

const ActionDropdown: FC<ActionDropdownProps> = ({ trigger, title, items, id }) => {
  const { push } = useRouter();
  const pathname = usePathname();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onClick={() => item?.action?.(id, { push, pathname })}
          >
            {capitalize(item.label)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown;
