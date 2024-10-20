import { useDebounce } from "@uidotdev/usehooks";
import { useSearchParams } from "next/navigation";

export const useSearch = (): { search: string } => {
  const searchParams = useSearchParams();

  const search = useDebounce(searchParams.get('search'), 1000) as string;

  return { search };
}