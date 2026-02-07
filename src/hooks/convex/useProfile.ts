import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export const useProfile = () => {
  const profile = useQuery(api.functions.users.getProfile);
  return {
    data: profile,
    isLoading: profile === undefined,
    isSuccess: profile !== undefined && profile !== null,
  };
};
