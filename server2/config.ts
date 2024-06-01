import dotenv from 'dotenv';
dotenv.config();

export default {
  HOST: process.env.HOST ?? 'http://localhost',
  PORT: process.env.PORT ?? 3001,
  MONGO_URI: 'mongodb://localhost:27017/test',
  MONGO_MOVIES_DB: 'movies',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  REDIS_PORT: 6379,
  REDIS_DB: 3,
  REDIS_EXPIRATION: 86400,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  RedisCacheStore: {
    movies: 'movie',
  },
  KAFKA_BROKERS: ['localhost:9092'],
  KAFKA_GROUP_ID: 'server-2',
};
