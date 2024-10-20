import { IUnknown } from '@/interface/Iunknown';
import { toast } from 'sonner';

export function onError(error: IUnknown) {
  toast('Error ❌', {
    description:
      `${error.message}: \n ${
        error?.response?.data?.error?.message ||
        error?.response?.data?.error?.formatted?.join(', ')
      }` || 'Something went wrong',
  });
}
