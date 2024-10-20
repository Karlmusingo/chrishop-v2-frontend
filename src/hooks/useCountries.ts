import { useGetList } from "@/hooks/api/common/getAll";
import { IUnknown } from "@/interface/Iunknown";
import { useMemo } from "react";

export const useCountries = (enabled?: boolean) => {
  const { data, isLoading, refetch } = useGetList({
    queryKey: "get-countries",
    endpoint: "/countries",
    enabled: enabled ?? true,
  });

  const countryOptions = useMemo(() => {
    return (
      (data?.data || ([] as any))?.map((country: any) => ({
        value: country.id,
        label: country.name,
      })) || []
    );
  }, [data?.data]);

  return {
    countryOptions,
    countries: data?.data || [],
    isLoading,
    refetch,
  };
};
