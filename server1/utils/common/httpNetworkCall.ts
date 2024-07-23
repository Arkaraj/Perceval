import axios, { Axios, AxiosRequestConfig } from 'axios';
import {
  IHttpService,
  INetworkRequestOptions,
  INetworkResponse,
  HttpStatusCodes,
  NetworkResponseOrError,
  IAxiosRequestWithRetryConfig,
  IHttpRetryStrategy,
} from '../../core';
import NetworkError from '../errors/NetworkError';

export class HttpNetworkCall implements IHttpService {
  private httpService: Axios; // ideally this should come from dependency injection

  constructor(
    baseURL: string,
    networkConfig: Partial<AxiosRequestConfig>,
    retryStrategy?: IHttpRetryStrategy
  ) {
    if (baseURL) networkConfig.baseURL = baseURL;
    this.httpService = axios.create(networkConfig);
    if (retryStrategy) retryStrategy.addRetry(this.httpService);
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    options?: IAxiosRequestWithRetryConfig
  ): Promise<NetworkResponseOrError<T>> {
    try {
      const response: INetworkResponse<T> = await this.httpService.request({
        method,
        url: endpoint,
        ...options,
      });

      if (
        response.status == HttpStatusCodes.InternalServerError ||
        response.status == HttpStatusCodes.ServiceUnavailable
      ) {
        throw new Error('Requested Server responded with 500');
      }

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
  ): Promise<NetworkResponseOrError<T>> {
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

  public async put<T>(endpoint: string, options?: INetworkRequestOptions) {
    try {
      return this.request<T>('PUT', endpoint, options);
    } catch (error) {
      throw error;
    }
  }
}
