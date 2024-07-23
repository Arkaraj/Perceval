import { Axios, AxiosResponse } from 'axios';
import {
  IHttpRetryStrategy,
  IHttpRetryConfig,
  HttpStatusCodes,
  ICircuitBreakerTriggerStrategy,
  CircuitBreakerState,
} from '../../core';
import { logger } from '../../utils';

export class HttpExponentialRetryStrategy implements IHttpRetryStrategy {
  private retryConfig: IHttpRetryConfig;
  private httpInstance: Axios;
  constructor(_retryConfig: IHttpRetryConfig) {
    this.retryConfig = _retryConfig;
  }

  private onResponse(response: AxiosResponse): AxiosResponse {
    return response;
  }

  // Adding retry, exponential backoff with jitter time
  private async onResponseError(error: any) {
    const statusCode =
      error?.response?.status || HttpStatusCodes.ServiceUnavailable;
    const currentRetryCount =
      error?.response?.config?.currentRetryCount ||
      error?.config?.currentRetryCount ||
      0;
    const retryCount = this.retryConfig.maxRetryCount || 1;
    const retryStatusCodes = this.retryConfig.retryStatusCodes || [];
    // const retryOnCodes =
    //   error?.response?.config?.retryOnCodes || error?.config?.retryOnCodes;
    const retryOnCodes = this.retryConfig.retryOnCodes || [];

    if (
      this.isRetryRequired({
        statusCode,
        currentRetryCount,
        retryCount,
        errorCode: error?.code || '',
        retryStatusCodes,
        retryOnCodes,
      })
    ) {
      this.exponentialRetryRequest(error);
    }
    return { ...error, status: statusCode };
  }

  private async exponentialRetryRequest(error: any): Promise<any> {
    logger.info('Retrying Api Call');
    const currentRetryCount =
      error?.response?.config?.currentRetryCount ??
      error?.config?.currentRetryCount ??
      0;
    error.config.currentRetryCount =
      currentRetryCount === 0 ? 1 : currentRetryCount + 1;
    // Create a new promise with exponential backoff
    const backOff = error?.request?.config?.backOff || 200;
    const backOffWithJitterTime = this.getTimeout(currentRetryCount, backOff);
    const backoffPromise = new Promise(function (resolve) {
      setTimeout(function () {
        resolve(true);
      }, backOffWithJitterTime);
    });

    await backoffPromise;
    return this?.httpInstance?.request(error?.config);
  }

  private isRetryRequired({
    statusCode,
    currentRetryCount,
    retryCount,
    errorCode,
    retryStatusCodes,
    retryOnCodes,
  }: {
    statusCode: number;
    currentRetryCount: number;
    retryCount: number;
    errorCode: string;
    retryStatusCodes: number[];
    retryOnCodes: string[];
  }): boolean {
    if (currentRetryCount < retryCount) {
      let statusCodeFlag = false;
      let errorCodeFlag = false;
      if (retryStatusCodes && statusCode) {
        statusCodeFlag = retryStatusCodes.includes(statusCode);
      }
      if (retryOnCodes && errorCode) {
        errorCodeFlag = retryOnCodes.includes(errorCode);
      }
      return statusCodeFlag || errorCodeFlag;
    }
    return false;
  }

  private getTimeout(numRetries: number, backoff: number) {
    const waitTime = Math.min(backoff * 2 ** numRetries);

    // Multiply waitTime by a random number between 0 and 1.
    return Math.random() * waitTime;
  }

  public addRetry(httpInstance: Axios): void {
    this.httpInstance = httpInstance;
    httpInstance.interceptors.request.use((config: any) => {
      config['retryCount'] = this.retryConfig.maxRetryCount;
      config['retryStatusCodes'] = this.retryConfig.retryStatusCodes;
      config['retryOnCodes'] = this.retryConfig.retryOnCodes;
      config['backOff'] = this.retryConfig.backoff;
      return config;
    });
    // as it's callback we will have to bind it with this
    httpInstance.interceptors.response.use(
      this.onResponse.bind(this),
      this.onResponseError.bind(this)
    );
  }
}

export class FailureRateTriggerStrategy
  implements ICircuitBreakerTriggerStrategy
{
  private failureRateThreshold: number;

  constructor(failureRateThreshold: number) {
    this.failureRateThreshold = failureRateThreshold;
  }

  public shouldOpen(
    failureCount: number,
    successCount: number,
    requestCount: number
  ): boolean {
    const failureRate = failureCount / requestCount;
    return failureRate >= this.failureRateThreshold;
  }

  public shouldHalfOpen(
    lastFailureTime: number,
    waitDurationInOpenState: number
  ): boolean {
    return Date.now() - lastFailureTime >= waitDurationInOpenState;
  }

  public shouldClose(successCount: number): boolean {
    return successCount > 0;
  }
}
