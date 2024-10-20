import { forwardRef } from "react";

import { cn } from "@/lib/utils";

import { InputUIProps } from "@/components/ui/input";

import Icon from "../Icon";

export type SearchProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Search = forwardRef<HTMLInputElement, InputUIProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-9 items-center rounded-md border bg-white pl-3 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        <Icon name="Search" className="h-[16px] w-[16px]" />
        <input
          {...props}
          type="search"
          placeholder={props.placeholder || "Search"}
          ref={ref}
          className="w-full bg-transparent p-2 placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    );
  }
);

Search.displayName = "Search";
