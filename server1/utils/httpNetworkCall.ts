import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { INetworkRequestOptions, INetworkResponse } from '../interfaces/index';

export default class HttpNetworkCall {
  private baseURL: string;

  constructor(baseURL?: string) {
    if (baseURL) this.baseURL = baseURL;
  }
  private async request<T>(
    method: string,
    endpoint: string,
    options?: AxiosRequestConfig
  ): Promise<INetworkResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axios({
        method,
        url: `${this.baseURL}${endpoint}`,
        ...options,
      });

      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      throw new Error('Network request failed: ' + error.message);
    }
  }

  public async get<T>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<INetworkResponse<T>> {
    try {
      return this.request<T>('GET', endpoint, options);
    } catch (error) {
      throw new Error('Network request failed: ' + error.message);
    }
  }

  public async post<T>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<INetworkResponse<T>> {
    try {
      return this.request<T>('POST', endpoint, options);
    } catch (error) {
      throw new Error('Network request failed: ' + error.message);
    }
  }
}
