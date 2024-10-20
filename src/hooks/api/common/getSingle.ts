import { IUnknown } from "@/interface/Iunknown";
import { useQuery } from "@tanstack/react-query";

import { api, IAxiosResponse } from "@/lib/axios";

interface FetchType {
  queryKey: string;
  endpoint: string;
  id?: string;
  enabled?: boolean;
}

const getEntity = async ({ queryKey }: IUnknown): Promise<IAxiosResponse> => {
  const [_key, { endpoint }] = queryKey;

  const data = (await api.get(endpoint)) as IAxiosResponse;
  return data;
};

export const useGetSingle = ({
  queryKey,
  endpoint,
  id,
  enabled = true,
}: FetchType) =>
  useQuery({
    queryKey: [queryKey, { endpoint, id }],
    queryFn: getEntity,
    enabled,
  });
