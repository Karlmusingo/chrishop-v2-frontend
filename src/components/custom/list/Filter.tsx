import { FC, ReactElement } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { capitalize, isEmpty } from "lodash";

import { cn } from "@/lib/utils";
import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { Search } from "../form/Search";
import ComboBoxFilter, { comboboxOptionsType } from "./Combobox";
import { ListPagination } from "./Pagination";

export interface TableFilterProps {
  options: {
    select?: string[];
    tab?: string[];
    combobox?: comboboxOptionsType[];
  };
  filterKey?: string;
  type?: "select" | "tab" | "combobox";
  hasPagination?: boolean;
  searchPlaceholder?: string;
  action?: ReactElement;
}

const ListFilter: FC<TableFilterProps> = ({
  options: { tab, combobox },
  filterKey,
  hasPagination = false,
  searchPlaceholder,
  action,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentFilter = searchParams.get(filterKey as string);
  const { pushQuery, pushQueryObject, createQueryString } = useQueryString();

  const table = useTable();

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between gap-2">
        {!!table.title && (
          <p className="font-serif text-lg font-semibold text-[var(--text-primary)]">{capitalize(table.title)}</p>
        )}
        <>
          {!isEmpty(tab) && (
            <div className="flex gap-1">
              <Link
                href={pathname}
                className={cn(
                  "inline-block rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
                  !currentFilter
                    ? "bg-[var(--accent-primary)] text-white"
                    : "bg-[#F5F5F5] text-[var(--text-secondary)] hover:bg-[#EBEBEB]"
                )}
              >
                Tout
              </Link>
              {tab?.map((filter: string) => {
                const labelMap: Record<string, string> = {
                  IN_STOCK: "En stock",
                  LOW_STOCK: "Stock bas",
                  OUT_OF_STOCK: "Rupture",
                };
                const label = labelMap[filter] || capitalize(filter?.split("_")?.join(" ") || "");
                return (
                  <Link
                    key={filter}
                    href={createQueryString(filterKey!, filter)}
                    className={cn(
                      "inline-block rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wide transition-colors",
                      currentFilter === filter
                        ? "bg-[var(--accent-primary)] text-white"
                        : "bg-[#F5F5F5] text-[var(--text-secondary)] hover:bg-[#EBEBEB]"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {!!combobox && !isEmpty(combobox) && (
            <ComboBoxFilter options={combobox} filterKey={filterKey} />
          )}
        </>

        {hasPagination && (
          <ListPagination
            meta={{
              total: 2,
              lastPage: 1,
              currentPage: 1,
              perPage: 10,
              prev: null,
              next: null,
            }}
          />
        )}

        <Search
          onChange={(ev) => pushQueryObject({ search: ev.target.value, page: "1" })}
          defaultValue={searchParams.get("search") as string}
          className="ml-auto"
          placeholder={searchPlaceholder}
        />

        {action}
      </div>
    </div>
  );
};

export default ListFilter;
