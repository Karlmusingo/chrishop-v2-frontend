import { baseApiType, createPayloadType } from "@/interface/api";
import { IUnknown } from "@/interface/Iunknown";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { api } from "@/lib/axios";

import { onError } from "./handlers";
import { ReactNode } from "react";

interface paramsInterface {
  data: IUnknown;
  callbackOnSuccess?: () => void;
  successMessage?: string | ReactNode;
}

async function createEntity(endpoint: string, data: IUnknown) {
  return api.post(endpoint, data);
}

export const useCreateMutation = ({
  queryKey,
  endpoint,
  Entity,
  showToast = true,
}: baseApiType) =>
  useMutation({
    mutationKey: [queryKey],
    mutationFn: ({ data }: paramsInterface) => createEntity(endpoint, data),
    onSuccess: (respData, { onSuccess }: createPayloadType) => {
      if (showToast) {
        toast(onSuccess?.message || `${Entity} created ✅`, {
          description: "The record should be visible on your catalogue.",
        });
      }

      onSuccess?.callback?.(respData.data);
    },
    onError,
  });
