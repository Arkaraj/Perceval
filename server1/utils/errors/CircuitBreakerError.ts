import { CircuitBreakerState } from '../../core';
import { logger } from '../logger';
export default class CircuitBreakerError extends Error {
  public status: {
    state: CircuitBreakerState;
    failureCount: number;
    successCount: number;
    requestCount: number;
    lastFailureTime: number | null;
  };
  constructor(
    message: string | undefined,
    config: {
      state: CircuitBreakerState;
      failureCount: number;
      successCount: number;
      requestCount: number;
      lastFailureTime: number | null;
    }
  ) {
    logger.error('CircuitBreaker Error');
    super(message);
    this.name = 'CircuitBreakerError';
    this.status = config;
  }
}
