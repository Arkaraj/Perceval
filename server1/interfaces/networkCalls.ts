import { AxiosRequestConfig } from 'axios';
export interface INetworkRequestOptions extends AxiosRequestConfig {
  headers?: { [key: string]: string };
  body?: any;
}

export interface INetworkResponse<T> {
  status: number;
  data: T;
}
