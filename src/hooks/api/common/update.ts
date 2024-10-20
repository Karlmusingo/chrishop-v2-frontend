import { updateApiType, updatePayloadType } from "@/interface/api";
import { IUnknown } from "@/interface/Iunknown";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import axiosHelper from "@/lib/axios";

import { onError } from "./handlers";
import { error } from "console";

interface paramsInterface {
  id?: string;
  data: IUnknown;
}

async function updateEntity(endpoint: string, data: IUnknown) {
  return axiosHelper().put(endpoint, data);
}

export const useUpdateMutation = ({
  queryKey,
  endpoint,
  Entity,
  skipIdPrefix = false,
}: updateApiType) =>
  useMutation({
    mutationKey: [queryKey],
    mutationFn: ({ id, data }: paramsInterface) => {
      const finalEndpoint =
        skipIdPrefix || !id ? endpoint : `${endpoint}/${id}`;
      return updateEntity(finalEndpoint, data);
    },
    onSuccess: (_, { onSuccess }: updatePayloadType) => {
      toast(onSuccess?.message || `${Entity} updated ✅`, {
        description: "The update should be visible on your catalogue.",
      });

      onSuccess?.callback?.();
    },
    onError: (error: IUnknown, { onError: onErrorData }) => {
      onErrorData?.callback?.();
      onError(error);
    },
  });

export interface updateMutationState {
  data?: IUnknown;
  isPending: boolean;
  error: any;
  isError: boolean;
}
