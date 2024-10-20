import { create } from "zustand";
import { IUnknown } from '@/interface/Iunknown';


interface profileStore {
  data: IUnknown;
  setData: (data: IUnknown) => void;
}

export const useProfileStore = create<profileStore>((set) => ({
  data: {},
  setData: (data) => {
    set({ data: data });
  }
}));
