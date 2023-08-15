export default {
  HOST: process.env.HOST || 'http://localhost',
  PORT: process.env.PORT || 3001,
  MONGO_URI: 'mongodb://localhost:27017/test',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
