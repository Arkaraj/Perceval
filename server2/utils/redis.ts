import RedisConn from 'ioredis';
import config from '../config';
import { IRedis } from '../core';

export class Redis implements IRedis {
  private redis: RedisConn;
  private static instance: IRedis;
  constructor() {
    this.redis = new RedisConn({
      port: config.REDIS_PORT,
      db: config.REDIS_DB,
      password: config.REDIS_PASSWORD,
    }); // Connect to 127.0.0.1:6379
  }

  static getInstance(): IRedis {
    if (!this.instance) {
      this.instance = new Redis();
    }
    return this.instance;
  }

  /**
   * Gets and Sets cache
   * @param {string} key The key value to store
   * @param {any} cb A callback function for if cache miss occurs
   */
  async getOrSet(
    key: string,
    cb: any,
    expiry: string | number = config.REDIS_EXPIRATION || 0
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.redis.get(key, async (err, data) => {
        if (err) {
          return reject(err);
        }
        if (data != null) {
          return resolve(JSON.parse(data));
        }
        const newData = await cb();
        this.redis.setex(key, expiry, JSON.stringify(newData));
        resolve(newData);
      });
    });
  }

  // For use of decorator
  GetOrSetCache(
    key: string,
    expiry: string | number = config.REDIS_EXPIRATION || 0
  ) {
    return function (
      _target: any,
      _propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]) {
        const redis = new Redis();
        // const cacheKey = key;
        return await redis.getOrSet(
          `${key}:${args[0]}`,
          originalMethod.bind(this, args),
          expiry
        );
      };

      return descriptor;
    };
  }

  async del(key: string) {
    try {
      let res = await this.redis.del(key);
      if (res) return res;
      return false;
    } catch (error) {
      return false;
    }
  }

  async set(key: string, value: any, expiry = config.REDIS_EXPIRATION || 0) {
    try {
      return await this.redis.set(key, JSON.stringify(value), 'EX', expiry);
    } catch (error) {
      return false;
    }
  }

  async get(key: string) {
    try {
      const result = await this.redis.get(key);
      if (result) {
        return JSON.parse(result);
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async hset(key: string, index: any, value: any) {
    try {
      let result = await this.redis.hset(key, index, value);
      if (result) {
        return result;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async hget(key: string, index: string) {
    try {
      let res = await this.redis.hget(key, index);
      if (res) return res;
      return false;
    } catch (error) {
      return false;
    }
  }

  // for custom redis setex
  async setex(
    key: string,
    value: any,
    expiry: number = config.REDIS_EXPIRATION
  ) {
    try {
      return this.redis.setex(key, expiry, JSON.stringify(value));
    } catch (error) {
      return false;
    }
  }
}
