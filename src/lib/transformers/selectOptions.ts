import { IUnknown } from '@/interface/Iunknown';
import { capitalize } from 'lodash';

interface configType {
  valueKey?: string;
  additionalKeys?: string[];
}

export const formatSelectOptions = (
  data: IUnknown,
  config: configType = {}
) => {
  if (!data) return [];
  const { valueKey = 'name', additionalKeys = [] } = config;
 
  return data?.map((item: IUnknown) => ({
    label: capitalize(item.name),
    value: item?.[valueKey],
    ...additionalKeys.reduce(
      (acc: IUnknown, key: string) => ({
        ...acc,
        [key]: item?.[key],
      }),
      {}
    ),
  }));
};

export const formatOptions = (data: (string | number)[]) => {
  return data?.map((item: string | number) => ({
    label: item,
    value: item,
  }));
}


