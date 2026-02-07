import { IUnknown } from '@/interface/Iunknown';
import { UnknownFunction } from '@/interface/unkownFunction';
import { isEmpty } from 'lodash';
import { create } from 'zustand';

interface defaultMeta {
  method: string;
  path: string;
}

export interface fullMetaType extends defaultMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

interface MetaStore {
  meta: fullMetaType | IUnknown;
  setData: (data: fullMetaType) => void;
  fetchNewMeta?: (callback: UnknownFunction) => void;
}

export const useMetaStore = create<MetaStore>((set) => ({
  meta: {},
  setData: (data: fullMetaType) => {
    if (!isEmpty(data)) set({ meta: data });
  },
  fetchNewMeta: (callback) => {
    callback?.();
  },
}));
