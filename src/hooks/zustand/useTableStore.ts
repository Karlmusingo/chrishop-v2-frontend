import { IUnknown } from "@/interface/Iunknown";
import { isEmpty } from "lodash";
import { create } from "zustand";

interface defaultMeta {
  method: string;
  path: string;
}

export interface tableOptionsType extends defaultMeta {
  title: string;
  filter: IUnknown;
}

interface TableStore {
  options: tableOptionsType | IUnknown;
  initiateTable: (data: Partial<tableOptionsType>) => void;
  clean: (valid?: boolean) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  options: { title: "Table" },
  initiateTable: (options: Partial<tableOptionsType>) => {
    if (!isEmpty(options)) set({ options });
  },
  clean: (valid?: boolean) => {
    if (valid) {
      set({ options: {} });
    }
  },
}));
