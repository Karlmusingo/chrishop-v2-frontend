import { RolesType } from '@/interface/roles';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import axiosHelper from '@/lib/axios';

async function selectAccountType(role: RolesType) {
  return axiosHelper().post('/users/account-type', { role });
}

interface IParams {
  callbackOnSuccess?: () => void;
}

export const useSelectAccount = (params?: IParams) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['account-type'],
    mutationFn: (role: RolesType) => selectAccountType(role),
    onSuccess: () => {
      // location?.replace('/profile');
      queryClient.invalidateQueries({ queryKey: ['profile'], refetchType: 'all' });
      toast('Account type selected', {
        description: 'You should be able to access business dashboard now.',
      });

      params?.callbackOnSuccess?.();
    },
    onError(error) {
      toast('Error ❌', {
        description: error.message || 'Something went wrong',
      });
    },
  });
};
