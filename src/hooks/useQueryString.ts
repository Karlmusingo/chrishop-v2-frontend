import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IUnknown } from '@/interface/Iunknown';
import { isEmpty, pick } from 'lodash';

export const useQueryString = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const path = pathname + '?';
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return path + params.toString();
    },
    [searchParams]
  );

  const removeQuery = useCallback(
    (name: string | string[]) => {
      const path = pathname + '?';
      const params = new URLSearchParams(searchParams);

      if (typeof name === 'string') {
        params.delete(name);
      } else {
        name.forEach((item) => params.delete(item));
      }

      router.push(path + params.toString());
    },
    [searchParams, router, pathname]
  );

  const pushQuery = useCallback(
    (name: string, value: string) => {
      if (value == '') return removeQuery(name);
      const path = createQueryString(name, value);
      router.push(path);
    },
    [createQueryString, removeQuery, router]
  );

  const pushQueryObject = useCallback(
    (queries: IUnknown) => {
      const path = pathname + '?';
      const currentParamsObject = Object.fromEntries(searchParams);

      const params = new URLSearchParams({
        ...currentParamsObject,
        ...queries,
      });
      const fullPath = path + params.toString();
      router.push(fullPath);
    },
    [router, pathname, searchParams]
  );

  const getQueryObject = useCallback(
    (keys: string[] = []) => {
      const currentParamsObject = Object.fromEntries(searchParams);

      return isEmpty(keys)
        ? currentParamsObject
        : pick(currentParamsObject, keys);
    },
    [searchParams]
  );

  return {
    createQueryString,
    pushQuery,
    removeQuery,
    pushQueryObject,
    getQueryObject,
  };
};
