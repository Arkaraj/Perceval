export abstract class IRedis {
  abstract GetOrSetCache(
    key: string,
    expiry?: number | string
  ): (
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) => PropertyDescriptor;
  abstract getOrSet(
    key: string,
    cb: any,
    expiry?: string | number
  ): Promise<any>;

  abstract del(key: string): Promise<number | boolean>;

  abstract set(
    key: string,
    value: any,
    expiry?: string | number
  ): Promise<'OK' | boolean>;

  abstract get(key: string): Promise<any>;

  abstract hset(key: string, index: any, value: any): Promise<any>;

  abstract hget(key: string, index: string): Promise<any>;

  abstract setex(
    key: string,
    value: any,
    expiry?: number
  ): Promise<'OK' | boolean>;
}
