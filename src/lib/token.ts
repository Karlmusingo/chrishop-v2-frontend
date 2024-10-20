export const getToken = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : undefined;

  return `Bearer ${token}`;
};

export const removeToken = () => {
  localStorage?.removeItem("token");
};

export const setToken = async (token: string) => {
  localStorage.setItem("token", token);
};

export default getToken;
