import { useSearchParams } from "next/navigation";
import { Table } from "@tanstack/react-table";

import { useQueryString } from "@/hooks/useQueryString";
import { useMetaStore } from "@/hooks/zustand/useMetaStore";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Button from "../Button";
import Icon from "../Icon";

export type paginationMeta = {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
};

interface TablePaginationProps<TData> {
  table?: Table<TData>;
  meta?: paginationMeta;
}

export function ListPagination<TData>({
  meta: manualMeta,
}: TablePaginationProps<TData>) {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const perPage = searchParams.get("perPage");
  const { pushQuery } = useQueryString();

  const { meta } = useMetaStore();

  const pagination = {
    setFistPage() {
      pushQuery("page", "1");
    },

    setLastPage() {
      pushQuery("page", `${meta.lastPage}`);
    },

    getTotalPage() {
      return meta.lastPage;
    },

    nextPage() {
      pushQuery("page", `${meta.currentPage + 1}`);
    },

    previousPage() {
      pushQuery("page", `${meta.currentPage - 1}`);
    },

    setPerPage(value: string) {
      pushQuery("perPage", value);
    },
  };

  if (!meta.total && !meta.page) {
    return null;
  }

  return (
    <div className="ml-auto flex items-center justify-between gap-1 px-2 lg:mr-4">
      <div className="flex space-x-4">
        <div className="flex items-center  space-x-2">
          <p className="line-clamp-1 text-sm font-medium">Per page</p>
          <Select
            value={`${perPage || meta?.perPage}`}
            onValueChange={(value) => {
              pagination.setPerPage(value);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={perPage} />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {meta?.currentPage}/{meta?.lastPage}
        </div>
        <Badge
          variant="outline"
          className=" my-auto rounded-sm px-1.5 py-[0.2rem] text-[0.65em]  text-neutral-700"
        >
          Total: {meta?.total}
        </Badge>
      </div>
      <div className="flex gap-1">
        <>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => pagination.setFistPage()}
            disabled={!meta?.prev}
          >
            <span className="sr-only">Go to first page</span>
            <Icon name="ChevronsLeft" className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => pagination.previousPage()}
            disabled={!meta?.prev}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to previous page</span>
            <Icon name="ChevronLeft" className="h-4 w-4" />
          </Button>
        </>

        <>
          <Button
            variant="outline"
            onClick={() => pagination.nextPage()}
            disabled={!meta?.next}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to next page</span>
            <Icon name="ChevronRight" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => pagination.setLastPage()}
            disabled={!meta?.next}
          >
            <span className="sr-only">Go to last page</span>
            <Icon name="ChevronsRight" className="h-4 w-4" />
          </Button>
        </>
      </div>
    </div>
  );
}
