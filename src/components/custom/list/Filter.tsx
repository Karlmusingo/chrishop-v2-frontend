import { FC, ReactElement } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { capitalize, isEmpty } from "lodash";

import { cn } from "@/lib/utils";
import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { Separator } from "@/components/ui/separator";

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
  const { pushQuery, createQueryString } = useQueryString();

  const table = useTable();

  return (
    <div className="mb-5">
      <div className="my-4 flex items-center justify-between gap-2">
        {!!table.title && (
          <p className=" text-lg font-semibold">{capitalize(table.title)}</p>
        )}
        <>
          {!isEmpty(tab) && (
            <div className="flex gap-2">
              <div
                className={cn(
                  " inline-block rounded-lg px-3  py-1 text-[.85em] font-semibold text-slate-600",
                  { "bg-slate-100 text-slate-800": !currentFilter }
                )}
              >
                <Link href={pathname}>All</Link>
              </div>
              {tab?.map((filter: string) => (
                <div
                  key={filter}
                  className={cn(
                    " inline-block rounded-lg px-3  py-1 text-[.85em] font-semibold text-slate-600",
                    {
                      "bg-slate-100 text-slate-800": currentFilter === filter,
                    }
                  )}
                >
                  <Link href={createQueryString(filterKey!, filter)}>
                    {capitalize(filter?.split("_")?.join(" ") || "")}
                  </Link>
                </div>
              ))}
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
          onChange={(ev) => pushQuery("search", ev.target.value)}
          defaultValue={searchParams.get("search") as string}
          className=" ml-auto"
          placeholder={searchPlaceholder}
        />

        {action}
      </div>
      <Separator />
    </div>
  );
};

export default ListFilter;
