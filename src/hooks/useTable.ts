import { useEffect } from "react";
import { tableOptionsType, useTableStore } from "./zustand/useTableStore"
import { isEmpty } from "lodash";

interface returnType extends tableOptionsType {
  clean: () => void;
}

export const useTable = (options?: Partial<tableOptionsType>) => {
  const { initiateTable, options: tableStoreOptions, clean } = useTableStore();
  
  useEffect(() => {
    if (!isEmpty(options)) initiateTable(options)
  }, [])

  return { ...tableStoreOptions, clean } as returnType;
}