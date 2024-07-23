import { AxiosRequestConfig, AxiosResponse } from 'axios';
export interface INetworkRequestOptions extends AxiosRequestConfig {
  headers?: { [key: string]: string };
  body?: any;
}

export interface IAxiosRequestWithRetryConfig
  extends Partial<AxiosRequestConfig> {
  retryCount?: number;
  retryStatusCodes?: string[];
  backoff?: number;
  timeout?: number;
}

export interface INetworkResponse<T> extends AxiosResponse<T> {
  status: 200 | 400 | 500 | 503;
}

interface INetworkSuccessResponse<T> {
  status: 200;
  data: T;
}

interface INetworkErrorResponse {
  status: 400 | 500;
  data: { message: string; error: string };
}

export type NetworkResponseOrError<T> =
  | INetworkSuccessResponse<T>
  | INetworkErrorResponse;

export abstract class IHttpService {
  abstract get<T = any>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<NetworkResponseOrError<T>>;

  abstract post<T = any>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<NetworkResponseOrError<T>>;

  abstract put<T = any>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<NetworkResponseOrError<T>>;
}
