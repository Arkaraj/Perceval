import { Axios } from 'axios';

export interface IRetryStrategy {
  addRetry(httpInstance: Axios): void; // this should ideally be httpInstance: IHttpInstace
}

export interface IRetryConfig {
  maxRetryCount: number;
  retryStatusCodes?: number[];
  backoff: number;
  retryOnCodes?: string[];
}
