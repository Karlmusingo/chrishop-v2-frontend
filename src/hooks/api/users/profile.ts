import { useQuery } from "@tanstack/react-query";

import axiosHelper from "@/lib/axios";
import { useProfileStore } from "@/hooks/zustand/users/useProfile";
import { useEffect } from "react";

const fetchUser = async () => {
  const { data } = await axiosHelper().get(`/users/profile`);

  return data.data;
};

export const useGetProfile = () => {
  const { setData } = useProfileStore();
  const { data, isSuccess, isLoading, isPending, error } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchUser,
  });

  useEffect(() => {
    if (isSuccess) {
      setData(data);
    }
  }, [isSuccess]);

  return { data, isLoading, isPending, error, isSuccess };
};
