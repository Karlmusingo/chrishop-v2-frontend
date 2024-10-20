import { IUnknown } from "@/interface/Iunknown";
import { useGetSingle } from "./api/common/getSingle";

type IState = {
  data: IUnknown;
  isLoading: boolean;
  refetch: () => void;
};

export const useSiteDetails = (id: string): IState => {
  const { data, isLoading, refetch } = useGetSingle({
    queryKey: "get-single-site",
    endpoint: `/sites/${id}`,
    id,
    enabled: !!id,
  });

  return {
    data: data?.data || {},
    isLoading,
    refetch,
  };
};
