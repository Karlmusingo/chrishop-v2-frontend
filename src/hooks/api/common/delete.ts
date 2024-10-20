import { baseApiType, deletePayloadType } from '@/interface/api';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import axiosHelper from '@/lib/axios';

import { onError } from './handlers';

interface paramsInterface {
  id: string;
}

const deleteSingleEntity = async (endpoint: string) => {
  const { data } = await axiosHelper().delete(endpoint);
  return data;
};

export const useDeleteSingleEntity = ({
  queryKey,
  endpoint,
  Entity,
}: baseApiType) =>
  useMutation({
    mutationKey: [queryKey],
    mutationFn: ({ id }: paramsInterface) =>
      deleteSingleEntity(`${endpoint}/${id}`),
    onSuccess: (_, { onSuccess }: deletePayloadType) => {
      toast(`${Entity} delete`, {
        description: 'The deleted item will no linger be visible.',
      });

      onSuccess?.callback?.();
    },
    onError,
  });
