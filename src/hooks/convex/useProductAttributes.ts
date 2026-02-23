import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function useProductAttributes() {
  const types = useQuery(api.functions.productTypes.list, {});
  const brands = useQuery(api.functions.productBrands.list, {});
  const colors = useQuery(api.functions.productColors.list, {});
  const sizes = useQuery(api.functions.productSizes.list, {});

  const toOptions = (items: Array<{ label: string; value: string }> | undefined) =>
    (items ?? []).map((item) => ({ label: item.label, value: item.value }));

  return {
    typeOptions: toOptions(types),
    brandOptions: toOptions(brands),
    colorOptions: toOptions(colors),
    sizeOptions: toOptions(sizes),
    isLoading:
      types === undefined ||
      brands === undefined ||
      colors === undefined ||
      sizes === undefined,
  };
}
