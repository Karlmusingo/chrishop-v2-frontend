import { IUnknown } from "@/interface/Iunknown";
import { useGetSingle } from "./api/common/getSingle";

type IState = {
  data: IUnknown;
  isLoading: boolean;
  refetch: () => void;
};

export const useZoneDetails = (id: string): IState => {
  const { data, isLoading, refetch } = useGetSingle({
    queryKey: "get-single-zone",
    endpoint: `/zones/${id}`,
    id,
    enabled: !!id,
  });

  return {
    data: data?.data || {},
    isLoading,
    refetch,
  };
};
