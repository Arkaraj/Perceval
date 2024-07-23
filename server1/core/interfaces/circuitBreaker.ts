import { CircuitBreakerState } from 'core/enums';

export abstract class ICircuitBreaker {
  abstract transitionToOpenState(): void;
  abstract transitionToClosedState(): void;
  abstract transitionToHaflOpenState(): void;
  abstract getCurrentState(): CircuitBreakerState;
  abstract call<T = any>(supplierFn: () => Promise<any>): Promise<T>;
}

export type CircuitBreakerRetryStrategy = (attempt: number) => Promise<void>;

export interface ICircuitBreakerTriggerStrategy {
  shouldOpen(
    failureCount: number,
    successCount: number,
    requestCount: number
  ): boolean;
  shouldHalfOpen(
    lastFailureTime: number,
    waitDurationInOpenState: number
  ): boolean;
  shouldClose(successCount: number): boolean;
}
