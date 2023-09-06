import { AxiosRequestConfig, AxiosResponse } from 'axios';
export interface INetworkRequestOptions extends AxiosRequestConfig {
  headers?: { [key: string]: string };
  body?: any;
}

// export interface INetworkResponse<T> {
//   status: number;
//   data: T;
// }

export interface INetworkResponse<T> extends AxiosResponse<T> {
  status: 200 | 400 | 500;
}

interface INetworkSuccessResponse<T> {
  status: 200;
  data: T;
}

interface INetworkErrorResponse {
  status: 400 | 500;
  data: { message: string; error: string };
}

export type INetworkResponseOrError<T> =
  | INetworkSuccessResponse<T>
  | INetworkErrorResponse;

export abstract class IHttpService {
  abstract get<T = any>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<INetworkResponseOrError<T>>;

  abstract post<T = any>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<INetworkResponseOrError<T>>;
}
