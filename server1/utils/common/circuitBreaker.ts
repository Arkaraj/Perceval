import {
  CircuitBreakerState,
  ICircuitBreakerTriggerStrategy,
  ICircuitBreaker,
  CircuitBreakerRetryStrategy,
} from '../../core';
import CircuitBreakerError from '../errors/CircuitBreakerError';
import { FailureRateTriggerStrategy } from './retryStrategy';

export class CircuitBreaker implements ICircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private lastFailureTime: number | null = null;
  private failureCount: number = 0;
  private successCount: number = 0;
  private requestCount: number = 0;
  private retryStrategy: CircuitBreakerRetryStrategy;
  private triggerStrategy: ICircuitBreakerTriggerStrategy;
  private waitDurationInOpenState: number;

  constructor(
    retryStrategy: CircuitBreakerRetryStrategy,
    triggerStrategy: ICircuitBreakerTriggerStrategy,
    waitDurationInOpenState: number
  ) {
    this.retryStrategy = retryStrategy;
    this.triggerStrategy = triggerStrategy;
    this.waitDurationInOpenState = waitDurationInOpenState;
  }

  private changeStateTransition(state: CircuitBreakerState) {
    this.state = state;
  }

  public transitionToOpenState() {
    this.changeStateTransition(CircuitBreakerState.OPEN);
  }

  public transitionToClosedState() {
    this.changeStateTransition(CircuitBreakerState.CLOSED);
  }

  public transitionToHaflOpenState() {
    this.changeStateTransition(CircuitBreakerState.HALF_OPEN);
  }

  public getCurrentState(): CircuitBreakerState {
    return this.state;
  }

  public async call<T>(supplierFn: () => Promise<any>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.isWaitDurationOver()) {
        this.state = CircuitBreakerState.HALF_OPEN;
      } else {
        // return this.retry(supplierFn);
        // return some default data, or just throw circuitBreakerError here
        return { data: 'circuit breaker opened' } as any;
      }
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      return this.tryCall(supplierFn);
    }

    return this.normalCall(supplierFn);
  }

  private async normalCall(supplierFn: CallableFunction): Promise<any> {
    this.requestCount++;
    try {
      const result = await supplierFn();
      this.successCount++;
      this.evaluateState();
      return result;
    } catch (error) {
      this.failureCount++;
      this.evaluateState();
      return this.retry(supplierFn);
      // throw error;
    }
  }

  private async tryCall(supplierFn: CallableFunction): Promise<any> {
    try {
      const result = await supplierFn();
      this.reset();
      return result;
    } catch (error) {
      this.state = CircuitBreakerState.OPEN;
      this.lastFailureTime = Date.now();
      return this.retry(supplierFn);
      // throw error;
    }
  }

  private async retry(supplierFn: CallableFunction): Promise<any> {
    let attempt = 0;
    while (
      this.state === CircuitBreakerState.OPEN &&
      !this.isWaitDurationOver()
    ) {
      attempt++;
      try {
        await this.retryStrategy(attempt);
        const result = await supplierFn();
        this.reset();
        return result;
      } catch (error) {
        // If the retry strategy does not throw an error, continue retrying, else propagate the error
        throw new CircuitBreakerError(
          error?.message || 'CircuitBreaker Error',
          {
            state: this.state,
            failureCount: this.failureCount,
            successCount: this.successCount,
            requestCount: this.requestCount,
            lastFailureTime: this.lastFailureTime,
          }
        );
      }
    }
    throw new CircuitBreakerError(
      'CircuitBreaker is in OPEN state and all retry attempts failed',
      {
        state: this.state,
        failureCount: this.failureCount,
        successCount: this.successCount,
        requestCount: this.requestCount,
        lastFailureTime: this.lastFailureTime,
      }
    );
  }

  private evaluateState(): void {
    if (
      this.state === CircuitBreakerState.CLOSED &&
      this.triggerStrategy.shouldOpen(
        this.failureCount,
        this.successCount,
        this.requestCount
      )
    ) {
      this.state = CircuitBreakerState.OPEN;
      this.lastFailureTime = Date.now();
    } else if (
      this.state === CircuitBreakerState.HALF_OPEN &&
      this.triggerStrategy.shouldClose(this.successCount)
    ) {
      this.reset();
    } else if (
      this.state === CircuitBreakerState.OPEN &&
      this.triggerStrategy.shouldHalfOpen(
        this.lastFailureTime!,
        this.waitDurationInOpenState
      )
    ) {
      this.state = CircuitBreakerState.HALF_OPEN;
    }
  }

  private isWaitDurationOver(): boolean {
    if (this.lastFailureTime === null) {
      return false;
    }
    return Date.now() - this.lastFailureTime >= this.waitDurationInOpenState;
  }

  private reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.requestCount = 0;
    this.lastFailureTime = null;
  }
}

export class CircuitBreakerFactory {
  public static getTriggerStrategy(failureRateInPercentage: number) {
    return new FailureRateTriggerStrategy(failureRateInPercentage / 100); // 50% failure rate threshold
  }

  /**
   * Get a Circuit Breaker Instance By priority, higher the priority higher the necessity of the function/class to get back up
   * @param {number} priority  Lower the priority higher retry/trigger functions
   * @returns {ICircuitBreaker}
   */
  public static getCircuitBreakerInstanceBasedOnPriority(
    priority: number
  ): ICircuitBreaker {
    if (priority < 2) {
      const exponentialBackoffStrategy: CircuitBreakerRetryStrategy = async (
        attempt
      ) => {
        const delay = Math.pow(2, attempt) * 100;
        return new Promise((resolve) => setTimeout(resolve, delay));
      };

      const triggerStrategy = this.getTriggerStrategy(5); // 5% failure rate threshold
      return new CircuitBreaker(
        exponentialBackoffStrategy,
        triggerStrategy,
        60000
      ); // 1 min wait duration
    }

    // less priority
    if (priority > 100) {
      const limitedRetryStrategy: CircuitBreakerRetryStrategy = async (
        attempt: number
      ) => {
        const maxAttempts = 3;
        if (attempt > maxAttempts) {
          throw new Error('Max retry attempts exceeded');
        }
        const delay = 1000; // Fixed interval of 1 second
        return new Promise((resolve) => setTimeout(resolve, delay));
      };

      const triggerStrategy = this.getTriggerStrategy(50); // 50% failure rate threshold
      return new CircuitBreaker(limitedRetryStrategy, triggerStrategy, 600000); // 10 mins wait duration
    }

    if (priority > 5) {
      const incrementalBackoffRetryStrategy: CircuitBreakerRetryStrategy =
        async (attempt: number) => {
          const delay = attempt * 500; // Incremental delay of 0.5 seconds per attempt
          return new Promise((resolve) => setTimeout(resolve, delay));
        };

      const triggerStrategy = this.getTriggerStrategy(70); // 70% failure rate threshold
      return new CircuitBreaker(
        incrementalBackoffRetryStrategy,
        triggerStrategy,
        60000
      ); // 1 min wait duration
    } else {
      throw new Error('No priority matched!');
    }
  }
}
