import { IUnknown } from "@/interface/Iunknown";
import { create } from "zustand";

type modalsType =  "newUser" | "menu-form"
interface ModalStore {
  openedModal?: modalsType;
  open: (context: modalsType, data?: IUnknown) => void;
  onClose: (maintain?: modalsType) => void;
  data?: IUnknown;
}

export const useModalStore = create<ModalStore>((set) => ({
  openedModal: undefined,
  open: (context, data) => set({ openedModal: context, data }),
  onClose: (maintain?: modalsType) => set({ openedModal: maintain }),
  data: {},
}));
