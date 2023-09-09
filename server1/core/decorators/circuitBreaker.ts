// Define states = OPEN, HALF_OPEN, CLOSED
export function CircuitBreaker<T>() {
  return function (
    _target: T,
    _propertyKey: string,
    _descriptor: PropertyDescriptor
  ) {
    try {
    } catch (error) {}
  };
}
