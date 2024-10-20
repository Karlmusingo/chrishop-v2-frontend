"use client";

import { ColumnDef } from "@tanstack/react-table";

import GridView, { GridViewSections } from "./views/Grid";
import { TableFilterProps } from "./Filter";
import { TableView } from "./views/Table";
import { IUnknown } from "@/interface/Iunknown";
import { ReactElement } from "react";

interface DataTableProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  columns?: ColumnDef<TData, TValue>[];
  sections?: GridViewSections<{ data: IUnknown }>[];
  data: IUnknown[];
  view?: "table" | "grid" | "list";
  state: {
    loading: boolean;
    error?: string;
  };
  filter: TableFilterProps;
  containerClassName?: string | undefined;
  action?: ReactElement;
  title?: string;
  searchPlaceholder?: string;
}

export function DataList<TData, TValue>({
  columns,
  sections,
  data,
  view = "table",
  state: { loading },
  filter,
  action,
  className,
  searchPlaceholder,
}: DataTableProps<TData, TValue>) {
  return (
    <div className="">
      {view === "table" && columns ? (
        <TableView
          columns={columns}
          data={data}
          state={{ loading }}
          filter={filter}
          action={action}
          searchPlaceholder={searchPlaceholder}
        />
      ) : (
        view === "grid" &&
        sections && (
          <GridView
            sections={sections}
            data={data}
            state={{ loading }}
            filter={filter}
            containerClassName={className}
            action={action}
          />
        )
      )}
    </div>
  );
}

// TODO: Improvements
// - Add manual pagination handled by the backend
// - Add sorting handled by the backend
// - Add filtering handled by the backend
