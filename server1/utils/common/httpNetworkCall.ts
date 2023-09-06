import axios, { Axios, AxiosRequestConfig } from 'axios';
import {
  IHttpService,
  INetworkRequestOptions,
  INetworkResponse,
  HttpStatusCodes,
  INetworkResponseOrError,
} from '../../core';
import NetworkError from '../errors/NetworkError';

export class HttpNetworkCall implements IHttpService {
  private httpService: Axios;

  constructor(baseURL?: string) {
    let networkConfig: AxiosRequestConfig = {};
    if (baseURL) networkConfig.baseURL = baseURL;
    this.httpService = axios.create(networkConfig);
  }
  private async request<T>(
    method: string,
    endpoint: string,
    options?: AxiosRequestConfig
  ): Promise<INetworkResponseOrError<T>> {
    try {
      const response: INetworkResponse<T> = await this.httpService.request({
        method,
        url: endpoint,
        ...options,
      });

      if (response.status == 500) throw new Error('Server2 responded with 500');

      return {
        status: response.status as 200, // had to do this trick to fix errors :(
        data: response.data,
      };
    } catch (error) {
      throw new NetworkError(
        'Network request failed: ' + error.message,
        HttpStatusCodes.ExternalDependencyError
      );
    }
  }

  public async get<T>(
    endpoint: string,
    options?: INetworkRequestOptions
  ): Promise<INetworkResponseOrError<T>> {
    try {
      return this.request<T>('GET', endpoint, options);
    } catch (error) {
      throw error;
    }
  }

  public async post<T>(endpoint: string, options?: INetworkRequestOptions) {
    try {
      return this.request<T>('POST', endpoint, options);
    } catch (error) {
      throw error;
    }
  }
}
