"use client";

import { ReactElement, useMemo } from "react";
import { IUnknown } from "@/interface/Iunknown";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ListPagination } from "@/components/custom/list/Pagination";

import ListFilter, { TableFilterProps } from "../Filter";

interface TableViewProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: IUnknown[];
  state: {
    pageIndex?: number;
    pageSize?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    loading: boolean;
    error?: string;
  };
  filter: TableFilterProps;
  action?: ReactElement;
  searchPlaceholder?: string;
}

export function TableView<TData, TValue>({
  columns,
  data,
  state: { loading },
  filter: { options: filterOptions, filterKey },
  action,
  searchPlaceholder,
}: TableViewProps<TData, TValue>) {
  const tableData = useMemo(
    () => (loading ? Array(4).fill({}) : data),
    [loading, data]
  );
  const tableColumns = useMemo(
    () =>
      loading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton className="h-3 w-[100px]" />,
          }))
        : columns,
    [loading, columns]
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="rounded-2xl border border-[var(--border-primary)] bg-white overflow-hidden">
      <div className="p-4">
        <ListFilter
          options={filterOptions}
          filterKey={filterKey}
          action={action}
          searchPlaceholder={searchPlaceholder}
        />
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucun resultat.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="border-t border-[var(--border-divider)] p-4">
        <ListPagination table={table} />
      </div>
    </div>
  );
}
