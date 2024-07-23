import { Axios } from 'axios';

export interface IHttpRetryStrategy {
  addRetry(httpInstance: Axios): void; // this should ideally be httpInstance: IHttpInstace
}

export interface IHttpRetryConfig {
  maxRetryCount: number;
  retryStatusCodes?: number[];
  backoff: number;
  retryOnCodes?: string[];
}
