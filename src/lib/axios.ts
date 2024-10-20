import { IUnknown } from "@/interface/Iunknown";
import Axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";

import getToken, { removeToken } from "./token";
import { fullMetaType } from "@/hooks/zustand/useMetaStore";
import { getCookie } from "./cookies";

const config = {
  baseUrl:
    process.env.NEXT_PUBLIC_NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_API_DEV_URL
      : process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "x-platform": process.env.NEXT_PUBLIC_PLATFORM,
    "Accept-Language": getCookie("lang"),
  },
};

const responseHandler = (response: any) => response.data;

const errorHandler = (error: any) => {
  if (error.response) {
    // if (error.response?.status === 401) removeToken();

    return Promise.reject({
      ...error,
      ...error.response.data,
      fullMessage: `${error.message}: \n ${
        error?.response?.data?.error?.message ||
        error?.response?.data?.error?.formatted?.join(", ")
      }`,
    });
  } else if (error.message)
    return Promise.reject({ ...error, response: { data: error } });
  else return Promise.reject("Unknown error!");
};

const requestConfig = async (req: InternalAxiosRequestConfig) => {
  const token = await getToken();
  console.log("token :>> ", token);

  req.headers.Authorization = token;

  return req;
};

const axiosHelper = (httpOptions?: {
  token?: string;
  url?: string;
  headers?: IUnknown;
}) => {
  let userToken = httpOptions?.token;

  if (typeof window !== "undefined") {
    userToken = localStorage.getItem("token") as string;
  }

  return Axios.create({
    baseURL:
      httpOptions?.url || process.env.NEXT_PUBLIC_NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_API_DEV_URL
        : process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: (userToken && `Bearer ${userToken}`) || undefined,
      "x-platform": process.env.NEXT_PUBLIC_PLATFORM,
      "x-api-key": process.env.REACT_APP_X_API_KEY,
      "Accept-Language": config.headers["Accept-Language"],
      ...httpOptions?.headers,
    },
  });
};

export const axios = Axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_API_DEV_URL
      : process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Authorization:
      typeof window !== "undefined"
        ? `Bearer ${localStorage.getItem("token") as string}`
        : undefined,
    "x-platform": process.env.NEXT_PUBLIC_PLATFORM,
    "x-api-key": process.env.REACT_APP_X_API_KEY,
  },
});

const api = Axios.create({
  ...config,
  baseURL: config.baseUrl,
});

api.interceptors.response.use(responseHandler, errorHandler);
api.interceptors.request.use(requestConfig);

export { api };

export default axiosHelper;

interface ResponseFormat<T = any> {
  meta: fullMetaType;
  data?: T;
  status: number;
}

export type IAxiosResponse<InnerData = any> = AxiosResponse<
  ResponseFormat<InnerData>
>;
